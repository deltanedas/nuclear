const resources = this.global.resources;

const day = 24 * 60 * 60;
const year = 365.25 * day;
const thoriumHalfLife = 1.405e10 * year; // Half life in seconds of Th-232

// Determine radioactivity from half life in seconds
function rad(halfLife) {
	return Items.thorium.radioactivity * Math.log(thoriumHalfLife / halfLife);
}

function add(element, isotopes, baseColour) {
	print(baseColour);
	baseColour = Color.valueOf(baseColour);
	const ret = {};
	var i = 0;
	for (var isotope in isotopes) {
		const halfLife = isotopes[isotope];
		ret[element + "-" + isotope] = {
			color: baseColour.mul(0.95 ^ i++), // Larger isotopes are brighter
			mask: "resources-clump",
			def: {
				radioactivity: rad(halfLife),
				_halfLife: halfLife
			}
		};
	}
	return this.global.resources.add(ret);
}

add("Ra", {"225": 14.9 * day, "226": 1600 * year}, "317c34");
add("Th", {
	"233": 21.83 * 60,
	"234": 24.1 * day
}, Items.thorium.color.toString());
add("U", {
	"233": 68.9 * year,
	"234": 2.445e5 * year,
	"235": 7.04e8 * year,
	"238": 4.468e9 * year
}, "#317c34");