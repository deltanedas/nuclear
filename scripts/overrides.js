// Remove vanilla reactors and RTG from inventory
function hide(block) {
	Blocks[block].buildVisibility = BuildVisibility.hidden;
}
hide("thoriumReactor");
hide("impactReactor");
