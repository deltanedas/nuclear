/*
	Copyright (c) DeltaNedas 2020

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/
const ReactorEntity = {
	getFuel() {
		return this._fuel;
	},
	setFuel(fuel) {
		this._fuel = fuel;
		this._progress = fuel === null ? 0 : fuel.fuelTicks();
	},

	getRodInsertion() {return this._rodInsertion;},
	setRodInsertion(set) {this._rodInsertion = set;},

	getProgress() {
		return this._progress;
	},

	process() {
		this._progress -= (100 - this._rodInsertion);
		return this._progress;
	},
	progressf() {
		return 1 - (this._progress / this._fuel.fuelTicks());
	},

	setWarmup(set) {this._warmup = set;},
	getWarmup() {return this._warmup;},
};

const lwr = extendContent(Block, "light-water-reactor", {
	load() {
		this.super$load();
		this.bottomRegion = Core.atlas.find(this.name + "-bottom");
		this.fuelRegion = Core.atlas.find(this.name + "-fuel");
		this.lightRegion = Core.atlas.find(this.name + "-light");
	},

	draw(tile) {
		Draw.rect(this.bottomRegion, tile.drawx(), tile.drawy());

		const fuel = tile.entity.fuel;
		if (fuel != null) {
			Draw.color(fuel.color);
			Draw.alpha(tile.entity.warmup);
			Draw.rect(this.fuelRegion, tile.drawx(), tile.drawy());
			Draw.color();
		}

		Draw.rect(this.region, tile.drawx(), tile.drawy());
		if (fuel != null) {
			Draw.color(fuel.color);
			Draw.alpha(tile.entity.progressf());
			Draw.rect(this.lightRegion, tile.drawx(), tile.drawy());
			Draw.color();
		}
	},

	update(tile) {
		const e = tile.entity;
		if (e.fuel == null) {
			const next = e.items.first();
			if (next == null || next.fissile !== true) {
				e.warmup = Mathf.lerpDelta(e.warmup, 0, 0.02);
			} else {
				e.items.remove(next, 1);
				e.fuel = next;
			}
		// Account for any kind of waste
		} else if (e.items.total() < this.itemCapacity * 2) {
			if (e.process() < 0) {
				this.useContent(tile, e.fuel.waste);
				this.offloadNear(tile, e.fuel.waste);
				e.fuel = e.items.first();
			}
			e.warmup = Mathf.lerpDelta(e.warmup, 1, 0.02);
		} else {
			e.warmup = Mathf.lerpDelta(e.warmup, 0, 0.02);
		}

		if (e.items.total() > 0 && e.timer.get(this.timerDump, this.dumpTime)) {
			this.tryDump(tile, e.fuel ? e.fuel.waste : Items.sand);
		}
	},

	generateIcons() {
		return [
			Core.atlas.find(this.name + "-bottom"),
			Core.atlas.find(this.name)
		];
	},

	acceptItem(item, tile, source) {
		if (item.fissile !== this.fissile) return false;
		const ent = tile.entity;
		return ent.items.get(item) < this.itemCapacity;
	},

	outputsItems: () => true
});
lwr.itemCapacity = 5;
lwr.fissile = true;
lwr.entityType = prov(() => {
	const ent = extend(TileEntity, ReactorEntity);
	// Off by default
	ent.rodInsertion = 100;
	ent.warmup = 0;
	return ent;
});
