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
const resources = require("resources/library");
const depletedBrightness = 0.5; // Brightness of depleted fuel cell texture

const day = 24 * 60 * 60;
const year = 365.25 * day;
const thoriumHalfLife = 1.405e10 * year; // Half life in seconds of Th-232

// radioactivity stat compared to vanilla Thorium
function rad(halfLife) {
	return Items.thorium.radioactivity * (thoriumHalfLife / halfLife);
}

function fixLocale(item, name, isDepleted) {
	const description = Core.bundle.get("item.nuclear-" + name + ".description");
	const oreName = Core.bundle.get("item.nuclear-" + name + ".name");

	const cell = "item.nuclear-" + (isDepleted ? "depleted-" : "") + "fuel-cell";
	item.localizedName = Core.bundle.format(cell + ".name", oreName);
	item.description = Core.bundle.get("item.nuclear-" + name + ".description", cell + ".description");
}

function addCell(name, colour, halfLife, cellFissile, wasteFissile) {
	var cell = name + "-fuel-cell", depleted = "depleted-" + cell
	var cells = {};
	cells[cell] = {
		color: colour,
		mask: "nuclear-fuel-cell",
		def: {
			getFissile: () => (cellFissile === undefined) ? true : cellFissile, // Let it be used in normal fission reactors
			fuelTicks: () => (halfLife / thoriumHalfLife) * 60 * 600,
			getWaste: () => this._waste,
			setWaste: set => { this._waste = set; }
		}
	};
	cells[depleted] = {
		color: colour,
		mask: "nuclear-fuel-cell",
		def: {
			getFissile: () => (wasteFissile === undefined) ? false : wasteFissile,
			fuelTicks: () => (halfLife / thoriumHalfLife) * 60 * 2.5,
			getWaste: () => Items.sand // placeholder
		}
	}

	const items = resources.add(cells);
	cell = items[cell];
	depleted = items[depleted];
	depleted.color.mul(depletedBrightness);

	for (var i in items) {
		items[i].layers = ["nuclear-fuel-cell-extra"]
	}
	cell.waste = depleted
	cell.radioactivity = rad(halfLife);
	depleted.radioactivity = cell.radioactivity * 2

	// Fix up locale
	fixLocale(cell, name);
	fixLocale(depleted, name, true);

	return cell;
}

addCell("thorium", Items.thorium.color, thoriumHalfLife, false);
addCell("uranium", "#245d26",
	(7.04e8 * 0.01 + 4.468e9 * 0.99) * year, // 1% 235
	false); // Fertile 99% U-238 is not fissile
addCell("enriched-uranium", "#317c34",
	(7.04e8 * 0.04 + 4.468e9 * 0.96) * year); // 4% 235
