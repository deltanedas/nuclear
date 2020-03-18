const ReactorEntity = {
	getFuel() {
		return this._fuel;
	},
	setFuel(fuel) {
		this._fuel = fuel;
		this._progress = fuel === null ? 0 : fuel.fuelTicks();
	},
	getProgress() {
		return this._progress;
	},
	process() {
		return this._progress--;
	},
	getProgressf() {
		return 1 - (this._progress / this._fuel.fuelTicks());
	},

	_fuel: null,
	_progress: null
};

const lwr = extendContent(GenericCrafter, "light-water-reactor", {
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
			Draw.alpha(tile.entity.progressf);
			Draw.rect(this.lightRegion, tile.drawx(), tile.drawy());
			Draw.color();
		}
	},

	update(tile) {
		const e = tile.entity;
		if (e.fuel === null) {
			const next = e.items.first();
			if (next == null || next.fissile !== true) {
				e.warmup = Mathf.lerpDelta(e.warmup, 0, 0.02);
			} else {
				e.fuel = next;
			}
		} else {
			if (e.process() < 0) {
				e.cons.trigger();
				this.useContent(tile, e.fuel.waste);
				this.offloadNear(tile, e.fuel.waste);
				e.fuel = e.items.first();
			}
			e.warmup = Mathf.lerpDelta(e.warmup, 1, 0.02);
		}
	},

	generateIcons() {
		return [
			Core.atlas.find(this.name + "-bottom"),
			Core.atlas.find(this.name)
		];
	}
});
lwr.entityType = prov(() => extend(GenericCrafter.GenericCrafterEntity, ReactorEntity));
lwr.solid = true;
lwr.consumes.add(new ConsumeItemFilter(boolf(item => {
	return item.fissile === true})).update(false).optional(true, false));