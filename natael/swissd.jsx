﻿#target indesign/* * CONFIG * KNOWN BUGS AND TODO:  - there is actualy only one line possible, maybe change that. *                       - which color for the rectangle-line? *                       - the config.color is hidden in the code, would be nice to bring to top *                       - due to the fact the font is now transparent, the shadow on *                         the bottom will shine through, this will generate an emboss effect. *                         so atm its not possible to use shadow with faded or u want the effect. *                       - shear is not centered *//* * MAIN CONFIGURATION */var config = {    // size of the document in mm    pageWidth:      297,    pageHeight:     210,    // this is the spacing between the word in mm    gutter:         2,    // if u use "---" in the array, it will    // be replaced with a rectangle this is the height in mm    lineHeight:     2,    // choose a font, this is quite tricky maybe u should    // generate a list of your fonts with this script:    // https://github.com/fabiantheblind/auto-typo-adbe-id/wiki/Fonts    fontFamily:     'Dezen Pro	_Heavy',    // this is the content of your generated typo    // each line represents a new line in the document    contents:       [                        "this is",                        "example",                        "text"                    ]};config.margins = {    // this are the margins for the document    // the right and left margin are quite important    // they are forcing the generated typo to shrink or grow    top:            40,    right:          100,    bottom:         40,    left:           100};config.bounds = {    // this is for calculating some internal stuff    // you propably don't need to edit this    top:            config.margins.top,    right:          config.pageWidth - config.margins.right,    bottom:         config.pageHeight - config.margins.bottom,    left:           config.margins.left,    width:          config.pageWidth - (config.margins.right + config.margins.left),    height:         config.pageHeight - (config.margins.top + config.margins.bottom)};config.customization = {    // turn shadow on or off    shadow:         0,    // turn shear on or off    shear:          0,    // turn rotation on or off    rotate:         0,    // turn centered on or off    centered:       1,    // turn the faded-effect on or off    faded:          0,    // turn a transparency mask on or off    vignette:       1,    // turn the perspective on or off    perspective:    0};config.shadow = {    // this is the left offset for the shadow (remember, its mm)    left:           0.5,    // this is the right offset ...    top:            0.5};config.shear = {    // this is the angle for shearing    angle:          15};config.rotate = {    // this is the angle for rotating    angle:          15};config.vignette = {    // thats the strenght of the vignette (opacity)    strength:       20};config.colors = {    // set the saturation for the background color    saturation:     100,    // set the brightness for the background color    brightness:     20};/* * Helper Functions */var helpers = {    size: function(obj) {        // well thats a helper-funtion to calculate the size        // of a textframe/polygon/rectangle whatever has a geometricBound        var rtn = {            height:     obj.geometricBounds[2] - obj.geometricBounds[0],            width:      obj.geometricBounds[3] - obj.geometricBounds[1]        };        rtn.multiplier = config.bounds.width / rtn.width;        return rtn;    },    colors: function(doc, num) {        // this is the old unharmonic random color generator        var rtn = [];        num = num || 10;        for(var i = 0; i < num; i++) {            var myColor = doc.colors.add();            var r = Math.random() * 255;            var g = Math.random() * 255;            var b = Math.random() * 255;            myColor.name       = "rnd color: " + i;            myColor.model      = ColorModel.PROCESS;            myColor.space      = ColorSpace.RGB;            myColor.colorValue = [r, g, b];            // calculate the greyness            myColor_brightness = (0.299 * r + 0.587 * g + 0.114 * b);            rtn.push({ color: myColor, name: myColor.name, brightness: myColor_brightness });        }        return rtn;    },    contrast: function(doc, brightness) {        // this is a lame atempt to check if we should use a black or white font :D        if(brightness < 200) {            // this is actualy the white swatch            return doc.swatches.item(2);        } else {            // this is actualy the black swatch            return doc.swatches.item(3);        }    },    threshold: function(sensivity, multiplier) {        var opacity = sensivity * multiplier;        if( opacity > 100) opacity = 100;        return opacity;    },    hsl2rgb: function(h, s, l) {        // http://www.codingforums.com/showthread.php?t=11156        var m1, m2, hue;        var r, g, b;        s /= 100;        l /= 100;        if(s === 0) {            r = g = b = (l * 255);        } else {            if(l <= 0.5) {                m2 = l * (s + 1);            } else {                m2 = l + s - l * s;            }            m1 = l * 2 - m2;            hue = h / 360;            r = this.hue2rgb(m1, m2, hue + 1/3);            g = this.hue2rgb(m1, m2, hue);            b = this.hue2rgb(m1, m2, hue - 1/3);        }        return {r: r, g: g, b: b};    },    hue2rgb: function(m1, m2, hue) {        // http://www.codingforums.com/showthread.php?t=11156        var v;        if(hue < 0) {            hue += 1;        } else if(hue > 1) {            hue -= 1;        }        if(6 * hue < 1) {            v = m1 + (m2 - m1) * hue * 6;        } else if(2 * hue < 1) {            v = m2;        } else if(3 * hue < 2){            v = m1 + (m2 - m1) * (2/3 - hue) * 6;        } else {            v = m1;        }        return 255 * v;    },    hslRange: function(start, max) {        // this is based on:        // https://github.com/fabiantheblind/auto-typo-adbe-id/wiki/HSL-Color-Wheel        var rtn = [];        for(var degrees = start; degrees < (start + max); degrees++) {            var radians             = ((degrees/360) % 360) * 2 * Math.PI;            var temp_hue            = degrees; // the hue of the color            var temp_saturation     = config.colors.saturation; // the saturation of the color            var temp_lightness      = config.colors.brightness; // the lighness of the color            var temp_rgb            = this.hsl2rgb(temp_hue, temp_saturation, temp_lightness);            var clrSw = doc.colors.add();// add a color every iteration            clrSw.properties = { /* set some props */              name:         "color " + degrees,              model:        ColorModel.PROCESS,              space:        ColorSpace.RGB,              colorValue:   [temp_rgb.r, temp_rgb.g, temp_rgb.b]            };            var rtnObj = { color: clrSw, brightness: temp_lightness * 2.55 };            rtn.push(rtnObj);        }        return rtn;    }};/* * MAIN SETUP */// add a new documentvar doc = app.documents.add({    documentPreferences: {        pageWidth:      config.pageWidth,        pageHeight:     config.pageHeight,        facingPages:    false    }});// generate 10 random swatches// old lame color-function//~ var swatches = helpers.colors(doc, 10);//~ var swatch = swatches[Math.floor(swatches.length * Math.random())];// generate hsl colors// new color-function// take a random value from 0-360 and generate a range from ex. 124 to 134var swatches = helpers.hslRange(Math.random() * 360, 10);// get a random swatch and use itvar swatch = swatches[Math.floor(swatches.length * Math.random())];// config colors object// you maybe should not change itconfig.colors = {    sensivity:  6,    background: swatch.color,    text:       helpers.contrast(doc, swatch.brightness)};// set screenmode to previewapp.activeWindow.screenMode = ScreenModeOptions.PREVIEW_TO_PAGE;// get first page from documentvar page = doc.pages.firstItem();// set page boundariespage.marginPreferences.properties = {    top:                config.margins.top,    right:              config.margins.right,    bottom:             config.margins.bottom,    left:               config.margins.left};// add a background rectangle - lockedvar bg = page.rectangles.add({    geometricBounds:    [                            0,                            0,                            config.pageHeight,                            config.pageWidth                        ],    fillColor:          config.colors.background,    strokeWeight:       0,    // locked it, so you can easily select the output in indesign    locked:             true});// add a radial gradient to the backgroundif(config.customization.vignette) {    // add a seconds rectangle with a black-color    var vignette = page.rectangles.add({        geometricBounds:    [                                0,                                0,                                config.pageHeight,                                config.pageWidth                            ],        fillColor:          doc.swatches.item(3),        strokeWeight:       0,        locked:             true    });    // set the transparency setting    vignette.transparencySettings.blendingSettings.properties = {        // set the blend-mode to multiply        blendMode: BlendMode.MULTIPLY,        opacity: config.vignette.strength    };    // set the gradient-type to radial    vignette.transparencySettings.gradientFeatherSettings.properties = {        applied: true,        angle: 90,        type: GradientType.RADIAL    };    // set the first stop opacity to 0, so you can look through    vignette.transparencySettings.gradientFeatherSettings.opacityGradientStops.item(0).properties = {        opacity: 0    };    // set the seconds stop opacity to 100, so it will be black    vignette.transparencySettings.gradientFeatherSettings.opacityGradientStops.item(1).properties = {        opacity: 100    };}/* * GENERATE ALL TEXTFRAMES AND CONVERT TO POLYGONS */var obsRect     = 0;var posObj      = {};for(var i = 0; i < config.contents.length; i++) {    // check if content is not "---"    if(config.contents[i] !== '---') {        // generate a textframe with the i-content from array        var tf = page.textFrames.add({            geometricBounds:    [                                    config.bounds.top,                                    config.bounds.left,                                    config.bounds.bottom,                                    config.bounds.right                                ],            contents:           config.contents[i]        });        // get the first paragraph from the textframe        var p = tf.paragraphs.firstItem();        // apply a font to it, and color it white or black        p.properties = {            appliedFont:        config.fontFamily,            fillColor:          config.colors.text        };        // change text to uppercase        p.changecase(ChangecaseMode.UPPERCASE);        // convert to polygons        tf.createOutlines();        // get the polygon and append it to posObj        var pos = 'pos-' + (i + obsRect);        posObj[pos] = page.polygons.firstItem();        // if we don't select the element, it won't work        // looks like a bug to me?        // tried without all the stuff here, did work without        // maybe there is something that will trigger the bug        // so this is the bugfix for me        posObj[pos].select();    } else {        // add a rectangle to the document        var line = page.rectangles.add({            geometricBounds: [                                config.bounds.top,                                config.bounds.left,                                config.bounds.top + config.lineHeight,                                config.bounds.right                             ],            fillColor:       doc.swatches.item(3),            strokeWeight:    0,            fillTint:        90        });        // add it to posObj        posObj['pos-' + i] = page.rectangles.firstItem();        // remove the "---" from the array        config.contents.splice(i, 1);        // substract one, so we dont end in an endless loop        i--;        // this is the counter for the rectangles,        // so we have the right "positions" in the posObj        obsRect++;    }}/* * SIZE AND POSITION ALL POLYGONS TO THE RIGHT POSITION */var history = {    // storage for the y-positions, that will be generated    height: config.bounds.top};// size polygonsfor(var i = 0; i < page.polygons.length; i++) {    // get all polygons on the document    var p = page.polygons;    // take the last and count down    var rev = (page.polygons.length - 1) - i;    // get the size with the helper-function    var size = helpers.size(p.item(rev));    // resize the polygons to the max-width which is possible    p.item(rev).resize(        CoordinateSpaces.PAGE_COORDINATES,        AnchorPoint.CENTER_ANCHOR,        ResizeMethods.MULTIPLYING_CURRENT_DIMENSIONS_BY,        [size.multiplier, size.multiplier]    );    // if the customization "faded" is on, it will calculate the "right" opacity    // bigger typos are loud and have less opacity    // smaller typos are quite and have more opacity    if(config.customization.faded) {        p.item(rev).transparencySettings.blendingSettings.properties = {            blendMode: BlendMode.NORMAL,            opacity: helpers.threshold(config.colors.sensivity, size.multiplier)        };    }}// position the objects in the posObj-Objectvar groupArr = [];for(pos in posObj) {    // get the obj    var obj = posObj[pos];    // move it to the right position    obj.move([config.bounds.left, history.height]);    // increase the history.height    history.height += helpers.size(obj).height + config.gutter;    // add to groupArr < will be our group later    groupArr.push(posObj[pos]);}// deselect all, just in case :papp.activeDocument.select(NothingEnum.NOTHING);// add groupArray to a grouppage.groups.add(groupArr);// get the groupvar group = page.groups.firstItem();/* * ADDITIONAL CUSTOMIZATIONS */// if shadow is turned on, duplicate groupif(config.customization.shadow) {    // duplicate the first group    group.duplicate([        config.bounds.left + config.shadow.left,        config.bounds.top + config.shadow.top    ]).sendBackward();    // get the new duplicated group    var duplicated = page.groups.lastItem();    // fill all polygons to black    duplicated.polygons.everyItem().properties = {        fillColor:  doc.swatches.item(1),        fillTint:   100    };    // fill all rectangles to black    duplicated.rectangles.everyItem().properties = {        fillColor:  doc.swatches.item(1),        fillTint:   100    };}// if shear is turned on, shear it with the transformation matrixif(config.customization.shear) {    var shear = app.transformationMatrices.add();    shear = shear.shearMatrix(config.shear.angle);    group.transform(        CoordinateSpaces.PASTEBOARD_COORDINATES,        AnchorPoint.CENTER_ANCHOR,        shear    );    if(config.customization.shadow) {        duplicated.transform(            CoordinateSpaces.PASTEBOARD_COORDINATES,            AnchorPoint.CENTER_ANCHOR,            shear        );    }}// if rotation is turned on, rotate it with the transformation matrixif(config.customization.rotate) {    var rotate = app.transformationMatrices.add();    rotate = rotate.rotateMatrix(config.rotate.angle);    group.transform(        CoordinateSpaces.PASTEBOARD_COORDINATES,        AnchorPoint.CENTER_ANCHOR,        rotate    );    if(config.customization.shadow) {        duplicated.transform(            CoordinateSpaces.PASTEBOARD_COORDINATES,            AnchorPoint.CENTER_ANCHOR,            rotate);    }}if(config.customization.centered) {    // get the size of the group    var size = helpers.size(group);    // move it to the center of the page    group.move([        (config.pageWidth / 2) - (size.width / 2),        (config.pageHeight / 2) - (size.height / 2)    ]);    // if there is a shadow, move it too with the right offset    if(config.customization.shadow) {        duplicated.move([            (config.pageWidth / 2) - (size.width / 2) + config.shadow.left,            (config.pageHeight / 2) - (size.height / 2) + config.shadow.top        ]);    }}if(config.customization.perspective) {    var size = helpers.size(group);    var depth = 70;    var offset = [50, 50];    // work in progress, to easily set an offset, which is understandable    offset[0] = depth - offset[0];    offset[1] = depth - offset[1];    // duplicate the first group i-times    for(var i = 0; i < depth; i++) {        group.duplicate([            (config.pageWidth / 2) - (size.width / 2) - (i / offset[0]),            (config.pageHeight / 2) - (size.height / 2) - (i / offset[1])        ]).sendBackward();        // get the new duplicated group        var duplicated = page.groups.firstItem();        // set the transparency setting        duplicated.transparencySettings.blendingSettings.properties = {            blendMode: BlendMode.NORMAL            // opacity: (i * 80) / 100        };        // subtract from the tint, so it will become "darker"        duplicated.polygons.everyItem().properties = {            fillColor: config.colors.background,            fillTint: 100 - (i / 2)        };    }    // this is the top-layer, which will be the front of the perspective    group.transparencySettings.blendingSettings.properties = {        blendMode: BlendMode.NORMAL,        opacity: 100    };    // fill all with white    group.polygons.everyItem().properties = {        fillColor: doc.swatches.item(2),        fillTint: 100    };    // move the new generated group to the center of the page    group.move([        (config.pageWidth / 2) - (size.width / 2) - (depth / offset[0]),        (config.pageHeight / 2) - (size.height / 2) - (depth / offset[1])    ]);    // the last item will add a white "halo"-effect, i just deleted it, to solve :p    page.groups.lastItem().transparencySettings.blendingSettings.properties = {        blendMode: BlendMode.NORMAL,        opacity: 0    };}// this is what the script will output in the javascript-console :)"woosh.";// you reached the end of the script.// yay.