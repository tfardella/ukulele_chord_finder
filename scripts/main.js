/*******************************
 * Let's draw some uke chords!!
 */

var chordEd = new Chord();
var clist = [];

chordEd.config.chordWidth = 120;
chordEd.config.numStrings = 4;
chordEd.config.editable = true;
chordEd.drawChord( "chordEdit", { "name": null, "code":"00000" } );

var i = 0;


function getChordsByKey( key )
{
	var ch = new Chord();
	return ch.lookupByKey( key );
}

function drawChords( el, list )
{
	var i = 0;

	for( i = 0; i < list.length; i++ )
	{
		var chord = new Chord();
		var id = "chord" + Date.now();
		var cdiv = $("<div/>").addClass("chord").attr( "id", id );
		$( el ).append( cdiv );
		chord.drawChord( id, list[ i ] );
	}
}

clist = ukeChords;
drawChords( "#All", clist );

// Handle tab selection event
$('#chordTabs a').on('shown.bs.tab', function (e) {
	var key = e.target.hash.substring( 1 );
	
	if( key === "All" )
	{
		clist = ukeChords;
	}
	else
	{
		clist = getChordsByKey( key );
	}

	drawChords( e.target.hash, clist ); 	
});
