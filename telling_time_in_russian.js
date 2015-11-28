(function(){

  "use strict";

  function unsupportedBrowser() {

    var fragment,
        h1;

    fragment = document.createDocumentFragment();
    h1 = document.createElement( 'h1' );
    h1.appendChild( document.createTextNode( "Unsupported Browser" ));
    fragment.appendChild( h1 );
    fragment.appendChild( document.createElement( 'p' ));
    fragment.appendChild( document.createTextNode(
        "This web page requires a modern browser that supports" +
        " HTML5 canvas. Please upgrade your browser in order to" +
        " view this page."
    ));

    while( document.body.hasChildNodes())
      document.body.removeChild( document.body.firstChild );

    document.body.appendChild( fragment );
    return false;
  }

  /* Test if DOM Level 2 is supported to exclude old browsers */
  if( typeof window.addEventListener == 'undefined' )
    return window.onload = unsupportedBrowser;

  /* Global object to keep track of what the clock is displaying. */
  var canvasClock = function() {

    var _hour = 0,
        _minute = 0,
        _clockIsRunning = false,
        _intervalID,
        _canvas,
        _ctx,
        _radius,
        _frUpdate;

    function _incrHour( h )   { return ((( h + 1 ) % 24 ) + 24 ) % 24; }
    function _decrHour( h )   { return ((( h - 1 ) % 24 ) + 24 ) % 24; }
    function _incrMinute( m ) { return ((( m + 1 ) % 60 ) + 60 ) % 60; }
    function _decrMinute( m ) { return ((( m - 1 ) % 60 ) + 60 ) % 60; }

    function _setClock( hour, minute ) {

      var second = 0;

      if( hour === null ) hour = _hour;
      if( minute === null ) minute = _minute;

      /* Save the time to private vars. */
      _hour = hour;
      _minute = minute;

      _frUpdate( hour, minute );

      _drawFace();
      _drawNumbers();

      /* hour */
      hour = hour % 12;
      hour = ( hour * Math.PI / 6 ) +
             ( minute * Math.PI / ( 6 * 60 )) +
             ( second * Math.PI / ( 360 * 60 ));
      _drawHand( hour, _radius * 0.5, _radius * 0.07 );

      /* minute */
      minute = ( minute * Math.PI / 30 ) +
               ( second * Math.PI / ( 30 * 60 ));
      _drawHand( minute, _radius * 0.8, _radius * 0.07 );
    }

    function _startClock() {

      _drawClock(); /* Update select buttons and timeText */
      _clockIsRunning = true;
      _intervalID = setInterval( _drawClock, 1000 );
    }

    function _stopClock() {

      if( ! _clockIsRunning ) return false;
      _clockIsRunning = false;
      clearInterval( _intervalID );
      _drawClock(); /* To hide the second hand. */
    }

    function _stepClock( forward ) {

      if( forward ) {
        _minute = _incrMinute( _minute );
        if( _minute === 0 ) _hour = _incrHour( _hour );
        _setClock( _hour, _minute );
      } else {
        _minute = _decrMinute( _minute );
        if( _minute === 59 ) _hour = _decrHour( _hour );
        _setClock( _hour, _minute );
      }
    }

    function _setCurrentTimeClock() {

      _drawClock();
    }

    function _clockStepHour( forward ) {
      if( forward ) {
        _setClock( _incrHour( _hour ), null );
      } else {
        _setClock( _decrHour( _hour ), null );
      }
    }

    function _clockStepMinute( forward ) {
      if( forward ) {
        _setClock( null, _incrMinute( _minute ));
      } else {
        _setClock( null, _decrMinute( _minute ));
      }
    }

    function _drawFace() {

      var grad;

      _ctx.beginPath();
      _ctx.arc( 0, 0, _radius, 0, 2 * Math.PI );
      _ctx.fillStyle = 'white';
      _ctx.fill();

      grad = _ctx.createRadialGradient(
              0, 0, _radius * 0.95, 0, 0, _radius * 1.05 );
      grad.addColorStop( 0, '#333' );
      grad.addColorStop( 0.5, 'white' );
      grad.addColorStop( 1, '#333' );
      _ctx.strokeStyle = grad;
      _ctx.lineWidth = _radius * 0.1;
      _ctx.stroke();

      _ctx.beginPath();
      _ctx.arc( 0, 0, _radius * 0.1, 0, 2 * Math.PI );
      _ctx.fillStyle = '#333';
      _ctx.fill();
    }

    function _drawNumbers() {

      var ang,
          num;

      _ctx.font = _radius * 0.15 + "px arial";
      _ctx.textBaseline = "middle";
      _ctx.textAlign = "center";

      for( num = 1; num < 13; num++ ) {

        ang = num * Math.PI / 6;
        _ctx.rotate( ang );
        _ctx.translate( 0, -_radius * 0.85 );
        _ctx.rotate( -ang );
        _ctx.fillText( num.toString(), 0, 0 );
        _ctx.rotate( ang );
        _ctx.translate( 0, _radius * 0.85 );
        _ctx.rotate( -ang );
      }
    }

    function _drawHand( pos, length, width ) {

      _ctx.beginPath();
      _ctx.lineWidth = width;
      _ctx.lineCap = "round";
      _ctx.moveTo( 0, 0 );
      _ctx.rotate( pos );
      _ctx.lineTo( 0, -length );
      _ctx.stroke();
      _ctx.rotate( -pos );
    }

    function _drawTime() {

      var now = new Date(),
          hour = now.getHours(),
          minute = now.getMinutes(),
          second = ( _clockIsRunning ) ? now.getSeconds() : 0;

      if(( ! _clockIsRunning ) || second === 0 ) {
        /* Save the time to private vars. */
        _hour = hour;
        _minute = minute;

        _frUpdate( hour, minute );
      }

      /* hour */
      hour = hour % 12;
      hour = ( hour * Math.PI / 6 ) +
             ( minute * Math.PI / ( 6 * 60 )) +
             ( second * Math.PI / ( 360 * 60 ));
      _drawHand( hour, _radius * 0.5, _radius * 0.07 );

      /* minute */
      minute = ( minute * Math.PI / 30 ) +
               ( second * Math.PI / ( 30 * 60 ));
      _drawHand( minute, _radius * 0.8, _radius * 0.07 );

      if( _clockIsRunning ) {
        /* second */
        second = ( second * Math.PI / 30 );
        _drawHand( second, _radius * 0.9, _radius * 0.02 );
      }
    }

    function _drawClock() {

      _drawFace();
      _drawNumbers();
      _drawTime();
    }

    function _init( fr ) {

      _frUpdate = fr; /* fuction reference */
      _canvas = document.getElementById( "canvas" );
      _ctx = _canvas.getContext( "2d" );
      _radius = _canvas.height / 2;
      _ctx.translate( _radius, _radius );
      _radius = _radius * 0.90;
      _drawClock();
    }

    return {
      init:        _init,
      set:         _setClock,
      start:       _startClock,
      stop:        _stopClock,
      step:        _stepClock,
      currentTime: _setCurrentTimeClock,
      stepHour:    _clockStepHour,
      stepMinute:  _clockStepMinute
    };
  }();

  /* Cardinal numbers in nominative case and feminine form (1, 2) */
  var CARDINAL_NUM_NOM_FEM = [
    "одна",
    "две"
  ];

  /* Cardinal numbers in nominative case masculine form (1-19) */
  var CARDINAL_NUM_NOM = [
    "ноль",
    "один",
    "два",
    "три",
    "четыре",
    "пять",
    "шесть",
    "семь",
    "восемь",
    "девять",
    "десять",
    "одиннадцать",
    "двенадцать",
    "тринадцать",
    "четырнадцать",
    "пятнадцать",
    "шестнадцать",
    "семнадцать",
    "восемнадцать",
    "девятнадцать"
  ];

  /* Cardinal numbers in nominative case masculine form (20, 30, 40, 50) */
  var CARDINAL_NUM_TENS_NOM = [
    "десять",
    "двадцать",
    "тридцать",
    "сорок",
    "пятьдесят"
  ];

  /* Cardinal numbers in genitive case masculine form (1-29) */
  var CARDINAL_NUM_GEN = [
    "одной",
    "двух",
    "трёх",
    "четырёх",
    "пяти",
    "шести",
    "семи",
    "восьми",
    "девяти",
    "десяти",
    "одиннадцати",
    "двенадцати",
    "тринадцати",
    "четырнадцати",
    "пятнадцати",
    "шестнадцати",
    "семнадцати",
    "восемнадцати",
    "девятнадцати",
    "двадцати",
    "двадцати одной",
    "двадцати двух",
    "двадцати трёх",
    "двадцати четырёх",
    "двадцати пяти",
    "двадцати шести",
    "двадцати семи",
    "двадцати восьми",
    "двадцати девяти"
  ];

  /* Ordinal numbers in genitive case masculine form (1st-12th) */
  var ORDINAL_NUM_GEN = [
    "первого",       /* 1st */
    "второго",       /* 2nd */
    "третьего",      /* 3rd */
    "четвёртого",    /* 4th */
    "пятого",        /* 5th */
    "шестого",       /* 6th */
    "седьмого",      /* 7th */
    "восьмого",      /* 8th */
    "девятого",      /* 9th */
    "десятого",      /* 10th */
    "одиннадцатого", /* 11th */
    "двенадцатого"   /* 12th */
  ];

  /*
  If you use % operator to calculate 'a mod c' and you get a negative result, you will
  get the correct result by adding 'c' to it. To deal with negative numbers 'c' is added
  to the result in every function below. Since it is always added another 'mod c'
  operation is applied to deal with positive numbers.
  */
  function convert24to12h( h )     { return (( h % 12 ) + 11 ) % 12 + 1; }
  function addHour12h( h, n )      { n = n || 1; return ((( h + n ) % 12 ) + 11 ) % 12 + 1; }
  function subtractHour12h( h, n ) { n = n || 1; return ((( h - n ) % 12 ) + 11 ) % 12 + 1; }
  function addHour( h, n )         { n = n || 1; return ((( h + n ) % 24 ) + 24 ) % 24; }
  function subtractHour( h, n )    { n = n || 1; return ((( h - n ) % 24 ) + 24 ) % 24; }
  function addMinute( m, n )       { n = n || 1; return ((( m + n ) % 60 ) + 60 ) % 60; }
  function subtractMinute( m, n )  { n = n || 1; return ((( m - n ) % 60 ) + 60 ) % 60; }

  /* Returns a parenthesized string */
  function ps( str ) { return '(' + str + ')'; }


  /* Tests if num is between 11 and 19 (ending in -надцать) */
  function isTeen( num ) {

    return ( num === 10 ) ? false : ( Math.floor( num / 10 ) === 1 );
  }


  function grammaticalCaseHourStr( num ) {

    switch( num % 10 ) {
    case 1:
      return isTeen( num ) ? "часов" : "час"; /* nominative */
    case 2:
    case 3: /* Fall through, break intentionally left out for case 2 & 3 */
    case 4:
      return isTeen( num ) ? "часов" : "часа"; /* genitive singular */
    default:
      return "часов"; /* genitive plural */
    }
  }


  function grammaticalCaseMinuteStr( num ) {

    switch( num % 10 ) {
    case 1:
      return isTeen( num ) ? "минут" : "минута"; /* nominative */
    case 2:
    case 3: /* Fall through, break intentionally left out for case 2 & 3 */
    case 4:
      return isTeen( num ) ? "минут" : "минуты"; /* genitive singular */
    default:
      return "минут"; /* genitive plural */
    }
  }


  function timeOfDayStr( hour ) {

    return (
      ( hour >=  0 && hour <=  4 ) ? "ночи"   : /* (of the night) for midnight – 5 am */
      ( hour >=  5 && hour <= 11 ) ? "утра"   : /* (of the morning) for 5 am – noon */
      ( hour >= 12 && hour <= 16 ) ? "дня"    : /* (of the day) for noon – 5 pm */
      ( hour >= 17 && hour <= 23 ) ? "вечера" : /* (of the evening) for 5 pm – midnight */
                                     ""         /* empty string for hours not in range 0-23 */
    );
  }


  function cardinalNumNom( num, gender ) {

    if( typeof gender === 'undefined') gender = 'm';

    var ones = num % 10,
        tens = Math.floor( num / 10 );

    if( num < 20 ) {
      /* ones and teens */
      if( gender === 'f' && ( num === 1 || num === 2 ))
        return CARDINAL_NUM_NOM_FEM[num - 1];
      return CARDINAL_NUM_NOM[num];
    }

    if( ones === 0 ) /* One of 20, 30, 40, 50 */
      return CARDINAL_NUM_TENS_NOM[tens - 1];

    if( gender === 'f' && ( num % 10 == 1 || num % 10 == 2 ))
      return CARDINAL_NUM_TENS_NOM[tens - 1] +
              ' ' + CARDINAL_NUM_NOM_FEM[ones - 1];

    return CARDINAL_NUM_TENS_NOM[tens - 1] +
            ' ' + CARDINAL_NUM_NOM[ones];
  }


  function cardinalNumGen( num ) {

    return CARDINAL_NUM_GEN[num - 1];
  }

  function ordinalNumGen( num ) {

    return ORDINAL_NUM_GEN[num - 1];
  }


  function oClockStr( hour, minute ) {

    var hour12h = convert24to12h( hour ),
        strTod = ' ' + ps( timeOfDayStr( hour )),
        strHour = "",
        strTimeArr = [],
        strUnitHour = "";
      
    switch( hour ) {

    /* 00:00 is a special case since it can be 00, 12, midnight and so on */
    case 0:
      strHour = cardinalNumNom( 12 );
      strTimeArr = [
        "полночь",
        grammaticalCaseHourStr( hour ) + strTod,
        "ровно " + strHour,
        strHour + " (ровно)",
        strHour + strTod,
        strHour + " ноль ноль"
      ];
      break;

    /* 01:00 and 13:00 is written час instead of один and 13:00 needs 12h format */
    case 1:
      strUnitHour = grammaticalCaseHourStr( hour );
        /* Fall through, break intentionally left out */
    case 13:
      if( "" === strUnitHour )
        strUnitHour = grammaticalCaseHourStr( hour12h );
      strTimeArr = [
        "ровно " + strUnitHour + strTod,
        strUnitHour + " (ровно)",
        strUnitHour + strTod,
        cardinalNumNom( hour ) + " ноль ноль"
      ];
      break;

    /* 12:00 is a special case since it can be 12, noon and so on */
    case 12:
      strHour = cardinalNumNom( hour );
      strTimeArr = [
        "полдень",
        "ровно " + strHour + ' ' +
            grammaticalCaseHourStr( hour ) + strTod,
        strHour + " (ровно)",
        strHour + strTod,
        strHour + " ноль ноль"
      ];
      break;

    /* All other times in 12h format and if the hour is greater than 12,
    an additional line with 24h format is used */
    default:
      strHour = cardinalNumNom( hour12h );
      strUnitHour = grammaticalCaseHourStr( hour12h );
      strTimeArr = [
        "ровно " + strHour + ' ' + strUnitHour + strTod,
        strHour + " (ровно)",
        strHour + ' ' + ps( strUnitHour ) + ' ' + strTod
      ];
      if( hour > 12 ) strTimeArr.push( cardinalNumNom( hour ) +
          ' ' + grammaticalCaseHourStr( hour ));
      strTimeArr.push( cardinalNumNom( hour ) + " ноль ноль" );
    }

    return strTimeArr;
  }


  function firstHalfHourStr( hour, minute ) {

    var hour12h = convert24to12h( hour ),
        nextHour12h = addHour12h( hour12h ),
        strZero = ( minute < 10 ) ? " ноль " : " ";

    return [].concat(
      (( 15 == minute ) ? ["четверть " +
          ordinalNumGen( nextHour12h )] : [] ),
      [cardinalNumNom( minute, 'f' ) +
          ' ' + grammaticalCaseMinuteStr( minute ) +
          ' ' + ordinalNumGen( nextHour12h ),
      cardinalNumNom( hour === 0 ? 12 : hour ) +
          strZero + cardinalNumNom( minute, 'f' )]
    );
  }


  function halfPastStr( hour, minute ) {

    var hour12h = convert24to12h( hour ),
        strNextHour12h = ordinalNumGen( addHour12h( hour12h )),
        strTod;

    /* Add an hour so that 11:30 gets "дня" and 23:30 gets "ночи" */
    strTod = ' ' + ps( timeOfDayStr( addHour( hour )));

    return [
      "пол" + strNextHour12h + strTod,
      "половина " + strNextHour12h,
      cardinalNumNom( hour12h ) + ' ' + cardinalNumNom( minute, 'f' ),
      cardinalNumNom( hour === 0 ? 12 : hour ) + ' ' + cardinalNumNom( minute, 'f' )
    ];
  }


  function secondHalfHourStr( hour, minute ) {

    /* без + genitive */

    var num        = 60 - minute,
        hour12h    = convert24to12h( hour ),
        strHour12h = (( hour12h == 12 ) ?
                     "час" :
                     cardinalNumNom( addHour12h( hour12h ))),
        strMin     = (( num % 10 == 1 ) && ( ! isTeen( num ))) ?
                     "минуты" :
                     "минут",
        strMinute  = (( num % 5 === 0 ) || ( num < 5 )) ?
                     ' (' + strMin + ') ' :
                     ' ' + strMin + ' ';

    return [].concat(
        (( 45 == minute ) ? ["без четверти " + strHour12h] : [] ),
        (( 35 <= minute ) ? ["без " + cardinalNumGen( num ) +
            strMinute + strHour12h] : [] ),
        [cardinalNumNom( hour === 0 ? 12 : hour ) +
            ' ' + cardinalNumNom( minute, 'f' )]
    );
  }


  function timeToText( hour, minute ) {

    var additionalFormatsArr = [];

    if( minute === 0 ) {
      additionalFormatsArr = oClockStr( hour, minute );
    }
    else if( minute < 30 ) {
      additionalFormatsArr = firstHalfHourStr( hour, minute );
    }
    else if( minute === 30 ) {
      additionalFormatsArr = halfPastStr( hour, minute );
    }
    else {
      additionalFormatsArr = secondHalfHourStr( hour, minute );
    }

    return additionalFormatsArr.concat( [
      cardinalNumNom( hour ) + ' ' +
      grammaticalCaseHourStr( hour ) + ' ' +
      cardinalNumNom( minute, 'f' ) + ' ' +
      grammaticalCaseMinuteStr( minute )
    ] );
  }


  function updateTimeHtml( hour, minute ) {

    updateTimeSel( hour, minute );
    updateTimeTextDiv( hour, minute );
  }


  function updateTimeSel( hour, minute ) {

    document.getElementById( 'sel-hour' ).value = hour;
    document.getElementById( 'sel-minute' ).value = minute;
  }


  function updateTimeTextDiv( hour, minute ) {

    var timeText = document.getElementById( "time-text" ),
        fragment,
        span,
        timeTextArr,
        arrLen,
        i;

    while( timeText.hasChildNodes())
      timeText.removeChild( timeText.firstChild );

    fragment = document.createDocumentFragment();
    timeTextArr = timeToText( hour, minute );
    arrLen = timeTextArr.length;
    for( i = 0; i < arrLen; i++ ) {

      span = document.createElement( 'span' );
      span.setAttribute( 'class', 'speak' );
      span.appendChild( document.createTextNode( timeTextArr[i] ));
      fragment.appendChild( span );

      if( i < arrLen - 1 ) {

        fragment.appendChild( document.createElement( 'br' ));

        span = document.createElement( 'span' );
        span.setAttribute( 'class', 'really-small' );
        span.appendChild( document.createTextNode( "или" ));
        fragment.appendChild( span );

        fragment.appendChild( document.createElement( 'br' ));
      }
    }

    timeText.appendChild( fragment );
  }


  function disableClockButtons() {

    var elements,
        i,
        j;

    elements = document.getElementById(
        "time-select" ).getElementsByClassName( "btn-up-down" );
    for( i = 0, j = elements.length; i < j; i++ )
        elements[i].disabled = true;

    elements = document.getElementById(
        "quick-select" ).getElementsByTagName( "button" );
    for( i = 0, j = elements.length; i < j; i++ )
        elements[i].disabled = true;

    elements = document.getElementById(
        "time-select" ).getElementsByTagName( "select" );
    for( i = 0, j = elements.length; i < j; i++ )
        elements[i].disabled = true;

    elements = document.getElementById(
        "clock-control" ).getElementsByTagName( "button" );
    for( i = 0, j = elements.length; i < j; i++ )
        if( elements[i].id != "btn-stop" ) elements[i].disabled = true;
  }


  function enableClockButtons() {

    var elements,
        i,
        j;

    elements = document.getElementById(
        "time-select" ).getElementsByClassName( "btn-up-down" );
    for( i = 0, j = elements.length; i < j; i++ )
        elements[i].disabled = false;

    elements = document.getElementById(
        "quick-select" ).getElementsByTagName( "button" );
    for( i = 0, j = elements.length; i < j; i++ )
        elements[i].disabled = false;

    elements = document.getElementById(
        "time-select" ).getElementsByTagName( "select" );
    for( i = 0, j = elements.length; i < j; i++ )
        elements[i].disabled = false;

    elements = document.getElementById(
        "clock-control" ).getElementsByTagName( "button" );
    for( i = 0, j = elements.length; i < j; i++ )
        elements[i].disabled = false;
  }


  function dumpStrings( e ) {

    var a,
        b,
        as;

    /* Clears the document body and dupms all 1440 lines
    of time expressions separated by ';' */
    while( document.body.hasChildNodes()) {
      document.body.removeChild( document.body.firstChild );
    }
    document.body.style.textAlign = 'left';
    for( a = 0; a < 24; a++) {
      for( b = 0; b < 60; b++ ) {
        as = timeToText( a, b ).reverse();
        document.body.appendChild( document.createTextNode(
            ( a < 10 ? '0' + a : a ) + ':' + ( b < 10 ? '0' + b : b ) + ";" +
            as.join( ';' ).replace( /\(|\)/g, '' ).replace( /ё/g, 'е' )));
        document.body.appendChild( document.createElement( 'br' ));
      }
    }
    e.preventDefault();
    return false;
  }

  /*
  Event handlers
  */

  function onInpTimeSelChange( e ) {

    if( e.target === e.currentTarget ) return;

    var sh = document.getElementById( "sel-hour" ),
        sm = document.getElementById( "sel-minute" );

    canvasClock.set(
      parseInt( sh.options[sh.selectedIndex].value ),
      parseInt( sm.options[sm.selectedIndex].value ));
  }


  function onUpDownClick( e ) {

    if( e.target === e.currentTarget ) return;

    switch( e.target.id ) {
    case "btn-hour-down":
      canvasClock.stepHour( false );
      break;
    case "btn-hour-up":
      canvasClock.stepHour( true );
      break;
    case "btn-min-down":
      canvasClock.stepMinute( false );
      break;
    case "btn-min-up":
      canvasClock.stepMinute( true );
      break;
    }
  }

  function onQuickSetClick( e ) {

    if( e.target === e.currentTarget ) return;

    switch( e.target.id ) {
    case "btn-midnight":
      canvasClock.set( 0, 0 );
      break;
    case "btn-morning":
      canvasClock.set( 6, 0 );
      break;
    case "btn-noon":
      canvasClock.set( 12, 0 );
      break;
    case "btn-evening":
      canvasClock.set( 18, 0 );
      break;
    case "btn-sharp":
      canvasClock.set( null, 0 );
      break;
    case "btn-q-past":
      canvasClock.set( null, 15 );
      break;
    case "btn-h-past":
      canvasClock.set( null, 30 );
      break;
    case "btn-q-to":
      canvasClock.set( null, 45 );
      break;
    }
    return false;
  }


  function onControlClick( e ) {

    if( e.target === e.currentTarget ) return;

    switch( e.target.id ) {
    case "btn-tick":
      canvasClock.step( true );
      break;
    case "btn-btick":
      canvasClock.step( false );
      break;
    case "btn-now":
      canvasClock.currentTime();
      break;
    case "btn-start":
      disableClockButtons();
      canvasClock.start();
      break;
    case "btn-stop":
      canvasClock.stop();
      enableClockButtons();
      break;
    }
    return false;
  }


  window.addEventListener( 'load', function() {

      var tc,
          ts;

      /* Detect HTML5 support */
      tc = document.createElement( "canvas" );
      if( typeof tc.getContext == 'undefined' )
        return unsupportedBrowser();

      document.body.addEventListener( 'click', function( e ) {
          if( e.target !== e.currentTarget ) {
            if( e.target.classList.contains( 'speak' ))
              responsiveVoice.speak( e.target.textContent,
                  "Russian Female" );
            }
          }
        );

      ts = document.getElementById( "time-select" );
      ts.addEventListener( 'click', onUpDownClick );
      ts.addEventListener( 'change', onInpTimeSelChange );

      document.getElementById( "quick-select" ).addEventListener(
          'click', onQuickSetClick );

      document.getElementById( "clock-control" ).addEventListener(
          'click', onControlClick );

      document.getElementById( "lnk-help"
          ).addEventListener( 'click', function( e ) {
            document.getElementById( 'help-screen' ).style.display = 'block';
            e.preventDefault();
          }
        );

      document.getElementById( "lnk-close-help"
          ).addEventListener( 'click', function( e ) {
            document.getElementById( 'help-screen' ).style.display = 'none';
            e.preventDefault();
          }
        );

      document.getElementById( "lnk-dump-str"
          ).addEventListener( 'click', dumpStrings );

      canvasClock.init( updateTimeHtml );
    }
  );

})();
