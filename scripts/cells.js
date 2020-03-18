const resources = require("resources/library");
const depletedBrightness = 0.5; // Brightness of depleted fuel cell texture

const day = 24 * 60 * 60;
const year = 365.25 * day;
const thoriumHalfLife = 1.405e10 * year; // Half life in seconds of Th-232

function rad(halfLife) {
	return Items.thorium.radioactivity * (thoriumHalfLife / halfLife);
}

function fixLocale(item, name, depleted) {
	name = Core.bundle.get("item.nuclear-" + name + ".name");
	depleted = depleted ? "depleted-" : "";
	item.localizedName = Core.bundle.format("item.nuclear-" + depleted + "fuel-cell.name", name);
	item.description = Core.bundle.get("item.nuclear-" + depleted + "fuel-cell.description");
}

function addCell(name, colour, halfLife, cellFissile, wasteFissile) {
	var cell = name + "-fuel-cell", depleted = "depleted-" + cell
	var cells = {};
	cells[cell] = {
		color: colour,
		mask: "nuclear-fuel-cell",
		def: {
			getFissile: () => (cellFissile === undefined) ? true : cellFissile, // Let it be used in normal fission reactors
			fuelTicks: () => (halfLife / thoriumHalfLife) * 60 * 2.5, // Thorium lasts 2.5 seconds
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