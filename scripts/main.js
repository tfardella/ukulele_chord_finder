/*******************************
 * Let's draw some uke chords!!
 */
$( function() {
	var chordEd = new Chord();
	var clist = [];

	// Draw editable chord
	chordEd.config.chordWidth = 120;
	chordEd.config.numStrings = 4;
	chordEd.config.editable = true;
	chordEd.drawChord( "chordEdit", { "name": null, "code":"10000" } );

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
			chord.config.chordWidth = 80;
			chord.config.numStrings = 4;
			chord.config.editable = false;

			var id = "chord" + Date.now();
			var csvg = $("<svg version='1.1' xmlns='http://www.w3.org/2000/svg' class='chord' />").attr( "id", id );
			$( el ).append( csvg );
			chord.drawChord( id, list[ i ] );
		}
	}

	// Fill in the All tab on initial page load
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
		var el = '#' + key;
		drawChords( el, clist );
	});
});