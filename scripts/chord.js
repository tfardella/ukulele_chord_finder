/*******************************************
 *
 */

var Chord = function()
{
	this.chordCode = 0;
	this.chordData = {};
	this.elem = null;
	this.paper = null;
	this.chordList = ukeChords;
	this.showAlt = false;
	this.stringLength = 0;
	this.stringSpacing = 20;
	this.fretSpacing = 20;

	this.config = 
	{
		//Default values
		"editable": false,
		"chordWidth": 100,
		"numStrings": 4,
		"numFrets": 5
	};

// paper height = chordWidth * 1.41666666666667

	this.stringSpacing = ( this.config.chordWidth * 0.6) / ( this.config.numStrings - 1 );
	this.fretSpacing = this.config.chordWidth * 0.2;
	this.dotRadius = this.config.chordWidth * 0.04;
};

Chord.prototype.clear = function( code )
{
	this.paper.clear();
};

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
};

Chord.prototype.lookupByName = function( name, alt )
{
	var list = this.chordList, i = 0, chords = [];
	
	alt = ( typeof alt !== "undefined" ) ? true : false;

	for( i = 0; i < list.length; i++ )
	{
		if( list[ i ].name === name )
		{
			chords.push( list[ i ] );
		}
	}

	return chords;
};

Chord.prototype.lookupByKey = function( key, alt )
{
	var list = this.chordList, i = 0, chords = [];

	alt = ( typeof alt !== "undefined" ) ? true : false;

	for( i = 0; i < list.length; i++ )
	{
		if( list[ i ].key === key )
		{
			chords.push( list[ i ] );
		}
	}

	return chords;
};

Chord.prototype.drawChord = function( elem, chordData )
{
	var self = this;
	var pathStr;

	self.chordData = chordData;
	self.elem = elem;

	var i = 0;

	var chordWidth = self.config.chordWidth;
	var path = {};
	var numStrings = self.config.numStrings;
	var stringSpacing = self.stringSpacing;
	var fretSpacing = self.fretSpacing;
	var numFrets = self.config.numFrets;
	var editable = self.config.editable;
	var ch = null;
	var el = null;
	var dotRadius;
	var dotDiameter;
	var topPadding = 4;
	var nutX = null;
	var nutY = null;
	var ttText = null;
	var ttBgRect = null;

	function initTooltip()
	{
		ttBgRect = ch.rect( 0, 0, 55, 17, 4, 4 );
		
		ttBgRect.attr( {
				'visibility': 'hidden',
				'id': 'tooltip_bg'
			} );

		ttBgRect.addClass( 'tooltip_bg' );
		
		ttText = ch.text( 0, 0, "Tooltip" );
		
		ttText.attr( {
				'visibility': 'hidden',
				'id': 'tooltip'
			} );
		
		ttText.addClass( 'tooltip' );
	}

	var showTooltip = function( evt, text )
	{
	    ttText.node.innerHTML = text;

	    var length = ttText.getBBox().width;
	    var x = 0, y = 0;

	    ttText.attr( {
	    	// "x": ( evt.clientX + 11 ),
	    	// "y": ( evt.clientY + 27 ),
	    	// 'x': ( evt.offsetX + 11 ),
	    	// 'y': ( evt.offsetY + 27 ),
	    	'x': ( evt.offsetX - 20  ),
	    	'y': ( evt.offsetY + 14 ),
	    	'fill':'black',
	    	'visibility':"visible"
	    } );

	    // TODO: make sure the tooltip is not going past the right edge of the paper
	    if( evt.offsetX + ( length + 8 ) < chordWidth )
	    {
	    	x = evt.offsetX - 24;
	    }
	    else
	    {
	    	x = chordWidth - ( length + 8 ) - 8;
	    }

	    ttBgRect.attr( {
	    	'width': ( length + 8 ),
	    	// "x": ( evt.clientX + 8 ),
	    	// "y": ( evt.clientY + 14 ),
	    	// 'x': ( evt.offsetX + 8 ),
	    	// 'y': ( evt.offsetY + 14 ),
	    	'x': x,
	    	'y': ( evt.offsetY + 14 ),
	    	'visibility':"visible"
	    } );
	}

	var hideTooltip = function( evt )
	{
	    ttText.attr( {
	    	"visibility":"hidden"
	    } );

	    ttBgRect.attr( {
	    	"visibility":"hidden"
	    } );

	}

	function getString( x )
	{
		var i = 0, spos = 0, string = 0;

		for( i = 0; i < numStrings; i++ )
		{
			spos = ( i + 1 ) * stringSpacing;

			if( x > ( spos - ( dotRadius * 2 ) ) && x < ( spos + ( dotRadius * 2 ) ) )
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
			fstart = nutY + ( i * fretSpacing );

			if( y > fstart && y < ( fstart + fretSpacing ) )
			{
				fret = i + 1 ;
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

	// if( chordData.alt === true && self.showAlt === false )
	// {
	// 	return;
	// }
	
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
//		ch = Snap( el, chordWidth, ( chordWidth * 1.6 ) );
		ch = Snap( el );
		self.paper = ch;
	}
	else
	{
		ch = self.paper;
	}

	
	fretSpacing = self.fretSpacing = chordWidth * 0.2;
	dotRadius = chordWidth * 0.04;
	dotDiameter = dotRadius * 2;

	var filledDot = function( str, fret )
	{
		var x = ( str - 1 ) * stringSpacing + nutX;
		var y = fret * fretSpacing - ( fretSpacing / 2 )  + nutY;

		var circ = ch.circle( x, y, dotRadius + 2 )
			.attr( { "fill": "#000000", "stroke": "none" } );

		if( editable )
		{
			circ.addClass( "clickable" );

			circ.node.onclick = function( evt )
				{	
					var s = getString( evt.offsetX );
					setData( s, "0" );

					ch.clear();
					self.drawChord( elem, chordData );
				};
		}
	};

	var openDot = function( str )
	{
		var radius = dotRadius;
		var x = ( str - 1 ) * stringSpacing + nutX;
		var y = nutY - ( radius * 2 );
		var circ = ch.circle( x, y, radius )
			.attr( { "fill": "white", "stroke": "#444444", "stroke-width": 1 } );

		if( editable )
		{
			circ.addClass( "clickable" );

			circ.node.onclick = function( evt )
				{
					var s = getString( evt.offsetX );
					setData( s, -1 );

					ch.clear();
					self.drawChord( elem, chordData );
//					console.log( "OpenDot clicked - layerX: " + evt.layerX + " - layerY: " + evt.layerY );
				};

			circ.node.onmousemove = function( evt )
			{
				showTooltip( evt, "Mute string" );
			}
			circ.node.onmouseout = function( evt )
			{
				hideTooltip( evt );
			}
		}
	};
	
	var muteString = function( str )
	{
		var radius = dotRadius;
		var tx = ( str - 1 ) * stringSpacing + ( nutX * 0.8) ;
		var ty = nutY - ( radius * 1.2 );
		var txt = ch.text( tx, ty, "x" )
			.attr( { "font-size": 14, fill: "#444444" } );

		if( editable )
		{
			txt.addClass( "clickable" );
			txt.attr( { "title": "Click to unmute string" } );

			txt.node.onclick = function( evt )
				{
					var s = getString( evt.layerX - stringSpacing );
					setData( s, 0 );
					ch.clear();
					self.drawChord( elem, chordData );

//					console.log( "muteString clicked - layerX: " + evt.layerX + " - layerY: " + evt.layerY );
				};
			txt.node.onmousemove = function( evt )
			{
				showTooltip( evt, "Unmute string" );
			}
			txt.node.onmouseout = function( evt )
			{
				hideTooltip( evt );
			}
		}
	};

	// Draw chord name

	if( editable )
	{
		var cl = self.lookupByCode( chordData.code );

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
					chordData.name += " / ";
				}
			}
		}
	}

	ch.text( ( chordWidth * 0.5 ), ( topPadding * 4 ), chordData.name )
		.attr( { "font-size": 14, fill: "#444444", "text-anchor": "middle" } );

	// Draw nut
	var nutWidth = chordWidth * 0.6; //60;
	var nl = ( chordWidth - nutWidth ) / 2;
	var nr = nl + nutWidth;
	pathStr = "M" + nl + " " + ( topPadding + ( chordWidth * 0.28 ) ) + " " + "L" + nr + " " + ( topPadding +  ( chordWidth * 0.28 ) ) ;
	var nut = ch.path( pathStr )
		.attr({ "stroke": "#444444" } );

	// If the chord does not start at the 1st fret change the nut and draw the fret #
	if( editable )
	{
		if( chordData.code[ 0 ] === "1" )
		{
			nut.attr( { "stroke-width": 5 } );
		}
		else
		{
			nut.attr( { "stroke-width": 2 } );
		}

		var tx = ( nut.getBBox().x - ( chordWidth * 0.135) );
		var ty = ( nut.getBBox().y + ( chordWidth * 0.15 ) );
		var ftxt = ch.text( tx, ty, chordData.code[ 0 ] )
			.attr( { "font-size": 14, fill: "#444444" } )
			.addClass( "clickable" );
	
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
					f = 1;
				}
				setData( 0, f );
				ch.clear();
				self.drawChord( elem, chordData );

//				console.log( "startFret clicked - layerX: " + evt.layerX + " - layerY: " + evt.layerY );
			};
	}
	else
	{
		if( chordData.code[ 0 ] === "1" )
		{
			nut.attr( { "stroke-width": 5 } );
		}
		else
		{
			nut.attr( { "stroke-width": 2 } );
			var tx2 = ( nut.getBBox().x - ( chordWidth * 0.17 ) );
			var ty2 = ( nut.getBBox().y + ( chordWidth * 0.17 ) );
			var pos = chordData.code[ 0 ];
			ch.text( tx2, ty2,  pos )
				.attr( { "font-size": 14, fill: "#444444" } );
		}
	}

	nutX = nut.getBBox().x;
	nutY = nut.getBBox().y;

	// Draw strings
	var stringLen = ( ( fretSpacing * numFrets ) + nutY );
	stringSpacing = self.stringWidth = nutWidth / ( numStrings - 1 );

//	console.log( "stringSpacing: " + stringSpacing + " nutWidth: " + nutWidth + " chordWidth: " + chordWidth );

	var clickHandler = function( evt )
		{
			var s = getString( evt.offsetX );
			var f = getFret( evt.offsetY );
			setData( s, f );

//			console.log( "String clicked - layerX: " + evt.layerX + " - layerY: " + evt.layerY + " string: " + s + " fret: " + f );
			
			ch.clear();
			self.drawChord( elem, chordData );
		};

	for( i = 0; i < numStrings; i++ )
	{
		pathStr = "M" + ( nutX + ( stringSpacing * i ) ) + " " + nutY + "L" + ( nutX + ( stringSpacing * i ) ) + " " + stringLen;
		var str = ch.path( pathStr )
			.addClass( "string" )
			.attr( { "stroke": "#444444", "stroke-width": 2 } );

		if( editable )
		{
			str.addClass( "clickable" );

			str.node.onclick = clickHandler;
		}
	}

	// Draw frets
	for( i = 1; i < ( numFrets + 1 ); i++ )
	{
		var fw = ( ( numStrings - 1 ) * stringSpacing ) + nutX;
		pathStr = "M " + nutX + " " + ( nutY + ( fretSpacing * i ) ) + " L " + fw + " " + ( nutY + ( fretSpacing * i ) );
		ch.path( pathStr )
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

	if( editable )
	{
//		initTooltip();
	}

	return el;
};

