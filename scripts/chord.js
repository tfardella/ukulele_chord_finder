/*******************************************
 *
 */

var Chord = function()
{
	this.chordCode = 00000;
	this.chordData = {};
	this.elem = null;
	this.paper = null;
	this.chordList = ukeChords;
	this.showAlt = false;

	this.config = {
		"editable": false,
		"chordWidth": 80,
		"numStrings": 4,
		"numFrets": 5
	}
};

Chord.prototype.clear = function( code )
{
	this.paper.clear();
}

Chord.prototype.lookupByCode = function( code )
{
	var list = this.chordList, i = 0, chords = [];

	for( i = 0; i < list.length; i++ )
	{
		if( list[ i ].code === code )
		{
			chords.push( list[ i ] );
		}
	}

	return chords;
}

Chord.prototype.lookupByName = function( name )
{
	var list = this.chordList, i = 0, chords = [];

	for( i = 0; i < list.length; i++ )
	{
		if( list[ i ].name === name )
		{
			chords.push( list[ i ] );
		}
	}

	return chords;
}

Chord.prototype.lookupByKey = function( key )
{
	var list = this.chordList, i = 0, chords = [];

	for( i = 0; i < list.length; i++ )
	{
		if( list[ i ].key === key )
		{
			chords.push( list[ i ] );
		}
	}

	return chords;
}

Chord.prototype.drawChord = function( elem, chordData )
{
	var self = this;
	self.chordData = chordData;
	self.elem = elem;

	var i = 0;

	var chordWidth = self.config.chordWidth;
	var path = {};
	var numStrings = self.config.numStrings;
	var stringWidth = 20;
	var numFrets = self.config.numFrets;
	var editable = self.config.editable;
	var fretHeight = 20;
	var ch = null;
	var el = null;
	var dotRadius;
	var topPadding = 4;

	function getString( x )
	{
		var i = 0, spos = 0, string = 0;

		for( i = 0; i < numStrings; i++ )
		{
			spos = ( i + 1 ) * stringWidth;

			if( x > ( spos - 4 ) && x < ( spos + 4 ) )
			{
				string = ( i + 1 );
			}
		}

		return string;
	}

	function getFret( y )
	{
		var i = 0, fpos = 0, fret = 0;

		for( i = 0; i < numFrets; i++ )
		{
			fstart = nutY + ( i * fretHeight );

			if( y > fstart && y < ( fstart + fretHeight ) )
			{
				fret = ( i + 1 );
			}
		}

		return fret;
	}

	function chordsFromCode ( code )
	{
		var ch = [], i = 0;
		for( i = 0; i < ukeChords.length; i++ )
		{
			if( ukeChords[ i ].code === code )
			{
				ch.push( ukeChords[ i ] );
			}	
		}

		return ch;
	}

	function setData( s, f )
	{
		if( ( s <= numStrings && f <= numFrets ) || s === 0 )
		{
			var ncd = "";

			for( i = 0; i < ( numStrings + 1); i++ )
			{
				if( s === i ) 
				{
					if( f < 0 )
					{
						ncd += "x";
					}
					else
					{
						ncd += f;
					}
				 }
				 else
				 {
				 	ncd += chordData.code[ i ];
				 } 
			}

			chordData.code = ncd;
		}
	}

	if( chordData.alt === true && self.showAlt === false )
	{
		return;
	}
	
	if( typeof elem === "string" )
	{
		el = document.getElementById( elem );
	}
	else if( elem.show()[ 0 ] instanceof HTMLElement )
	{
		el = elem;
	}

	if( self.paper === null )
	{
		ch = Raphael( el, chordWidth, ( chordWidth * 1.6 ) );
		self.paper = ch;
	}
	else
	{
		ch = self.paper;
	}

	
	fretHeight = chordWidth * 0.2;
	dotRadius = chordWidth * 0.04;

	var filledDot = function( str, fret )
	{
		var x = ( str - 1 ) * stringWidth + nutX;
		var y = fret * fretHeight - ( fretHeight / 2 )  + nutY;

		var circ = ch.circle( x, y, dotRadius + 2 )
			.attr( { "fill": "#000000", "stroke": "none" } );

		if( editable === true )
		{
			circ.node.onclick = function( evt )
				{	
					var s = getString( evt.layerX );
					setData( s, "0" );

					ch.clear();
					self.drawChord( elem, chordData );
				}
		}
	};

	var openDot = function( str )
	{
		var radius = dotRadius;
		var x = ( str - 1 ) * stringWidth + nutX;
		var y = nutY - ( radius * 2 );
		var circ = ch.circle( x, y, radius )
			.attr( { "fill": "white", "stroke": "#444444", "stroke-width": 1 } );

		if( editable === true )
		{
			circ.node.onclick = function( evt )
				{
					var s = getString( evt.layerX );
					setData( s, -1 );

					ch.clear();
					self.drawChord( elem, chordData );
//					console.log( "OpenDot clicked - layerX: " + evt.layerX + " - layerY: " + evt.layerY );
				}
		}
	};
	
	var muteString = function( str )
	{
		var radius = dotRadius;
		var tx = ( str - 1 ) * stringWidth + nutX;
		var ty = nutY - ( radius * 2.4 );
		var txt = ch.text( tx, ty, "x" )
			.attr( { "font-size": 14, fill: "#444444" } );

		if( editable === true )
		{
			txt.node.onclick = function( evt )
				{
					var s = getString( evt.layerX );
					setData( s, 0 );
					ch.clear();
					self.drawChord( elem, chordData );
//					console.log( "muteString clicked - layerX: " + evt.layerX + " - layerY: " + evt.layerY );
				}
		}
	};

	// Draw chord name

	if( editable )
	{
		var cl = self.lookupByCode( chordData.code ), i = 0;
		if( cl.length === 0 )
		{
			chordData.name = "????";
		}
		else
		{
			chordData.name = "";
			for( i = 0; i < cl.length; i++ )
			{
				chordData.name += cl[ i ].name;

				if( i < cl.length - 1 )
				{
					chordData.name += " / "
				}
			}
		}
	}

	ch.text( ( chordWidth * 0.5 ), ( topPadding * 3 ), chordData.name )
		.attr( { "font-size": 14, fill: "#444444" } );

	// Draw nut
	var nutWidth = chordWidth * 0.6; //60;
	var nl = ( chordWidth - nutWidth ) / 2;
	var nr = nl + nutWidth;
	var nut = ch.path( [ "M", nl, ( topPadding + ( chordWidth * 0.38 ) ), "L", nr, ( topPadding +  ( chordWidth * 0.38 ) ) ] )
		.attr({ "stroke": "#444444" } );

	// If the chord does not start at the 1st fret change the nut and draw the fret #
	if( editable === true )
	{
		if( chordData.code[ 0 ] === "0" )
		{
			nut.attr( { "stroke-width": 5 } );
		}
		else
		{
			nut.attr( { "stroke-width": 2 } );
		}

		var tx = ( nut.getBBox().x - ( chordWidth * 0.135) );
		var ty = ( nut.getBBox().y + ( chordWidth * 0.12 ) );
		var ftxt = ch.text( tx, ty, chordData.code[ 0 ] )
			.attr( { "font-size": 14, fill: "#444444" } );
		ftxt.node.onclick = function( evt )
			{
				var s = getString( evt.layerX );
				var f = chordData.code[ 0 ];
				if( f < 9 )
				{
					f++;
				}
				else
				{
					f = 0;
				}
				setData( 0, f );
				ch.clear();
				self.drawChord( elem, chordData );
//				console.log( "startFret clicked - layerX: " + evt.layerX + " - layerY: " + evt.layerY );
			}
	}
	else
	{
		if( chordData.code[ 0 ] === "0" )
		{
			nut.attr( { "stroke-width": 5 } );
		}
		else
		{
			nut.attr( { "stroke-width": 2 } );
			var tx = ( nut.getBBox().x - ( chordWidth * 0.135) );
			var ty = ( nut.getBBox().y + ( chordWidth * 0.12 ) );
			ch.text( tx, ty, chordData.code[ 0 ] )
				.attr( { "font-size": 14, fill: "#444444" } );
		}
	}

	var nutX = nut.getBBox().x;
	var nutY = nut.getBBox().y;

	// Draw strings
	var stringLen = ( ( fretHeight * numFrets ) + nutY );
	stringWidth = nutWidth / ( numStrings - 1 );

	for( i = 0; i < numStrings; i++ )
	{
		var str = ch.path( [ "M", ( nutX + ( stringWidth * i ) ), nutY, "L", ( nutX + ( stringWidth * i ) ), stringLen ] )
			.attr( { "stroke": "#444444", "stroke-width": 2 } );

		if( editable === true )
		{
			str.node.onclick = function( evt )
			{
				var s = getString( evt.layerX );
				var f = getFret( evt.layerY );
				setData( s, f );

//				console.log( "String clicked - layerX: " + evt.layerX + " - layerY: " + evt.layerY + " string: " + s + " fret: " + f );
				ch.clear();
				self.drawChord( elem, chordData );
			}
		}
	}

	// Draw frets
	for( i = 1; i < numFrets + 1; i++ )
	{
		var fw = ( ( numStrings - 1 ) * stringWidth ) + nutX;
		ch.path( [ "M", nutX, ( nutY + ( fretHeight * i ) ), "L", fw, ( nutY + ( fretHeight * i ) ) ] )
			.attr( { "stroke": "#888888", "stroke-width": 1 } );
	}

	// Draw dots
	for( i = 1; i < chordData.code.length; i++ )
	{
		if( chordData.code[ i ] === "0" )
		{
			openDot( i );
		}
		else if( chordData.code[ i ].toLowerCase() === "x" )
		{
			muteString( i );
		}
		else if ( chordData.code[ i ] > 0 && chordData.code[ i ] < ( numFrets + 1 ) )
		{
			filledDot( i , chordData.code[ i ] );
		}
	}

	return el;
};

