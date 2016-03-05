/*******************************
 * Let's draw some uke chords!!
 */
$( function() {
	var clist = [];
	var i = 0;

	function drawEditableChord( chordData )
	{
		var chordEd = new Chord();
		var cname = null, ccode = "10000";

		if( chordData )
		{
			cname = chordData.name;
			ccode = chordData.code;
		}

		// Draw editable chord
		chordEd.config.chordWidth = 120;
		chordEd.config.numStrings = 4;
		chordEd.config.editable = true;
		chordEd.drawChord( "chordEdit", { "name": cname, "code":ccode } );
	}

	function getChordsByKey( key )
	{
		var ch = new Chord();
		return ch.lookupByKey( key );
	}

	var chordClickHandler = function( chordData, chord )
	{
		drawEditableChord( chordData );
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
			chord.config.chordClickHandler = chordClickHandler;

			var id = "chord" + Date.now();
			var csvg = $("<svg version='1.1' xmlns='http://www.w3.org/2000/svg' class='chord' />").attr( "id", id );
			$( el ).append( csvg );
			chord.drawChord( id, list[ i ] );
		}
	}

	// Draw editable chord
	drawEditableChord( );

	// Fill in the AFlat tab on initial page load
	drawChords( "#AFlat", getChordsByKey( "AFlat" ) );

	// Handle tab selection event
	$('#chordTabs a').on('shown.bs.tab', function (e) {
		var key = e.target.hash.substring( 1 );
		
		clist = getChordsByKey( key );

		var el = '#' + key;
		$( el ).empty();	// clear exiting content
		drawChords( el, clist );
	});
});