// Dependencies:
// * http://jquery.com/
// * https://github.com/mondalaci/positional-format.js
// $ bower install jquery positional-format.js

function dxfToSvg(dxfString)
{
    "use strict";

    function dxfObjectToSvgSnippet(dxfObject)
    {
        function deg2rad(deg)
        {
            return deg * (Math.PI/180);
        }

        switch (dxfObject.type) {
            case 'LINE':
                return '<line x1="{0}" y1="{1}" x2="{2}" y2="{3}"/>'.
                        format(dxfObject.x, dxfObject.y, dxfObject.x1, dxfObject.y1);
            case 'CIRCLE':
                return '<circle cx="{0}" cy="{1}" r="{2}"/>'.format(dxfObject.x, dxfObject.y, dxfObject.r);
            case 'ARC':
                var x1 = dxfObject.x + dxfObject.r * Math.cos(deg2rad(dxfObject.a0));
                var y1 = dxfObject.y + dxfObject.r * Math.sin(deg2rad(dxfObject.a0));
                var x2 = dxfObject.x + dxfObject.r * Math.cos(deg2rad(dxfObject.a1));
                var y2 = dxfObject.y + dxfObject.r * Math.sin(deg2rad(dxfObject.a1));
                return '<path d="M{0},{1} A{2},{3} 0 1,1 {4},{5}"/>'.format(x1, y1, dxfObject.r, dxfObject.r, x2, y2);
        }
    }

    var groupCodes = {
        0: 'entityType',
        2: 'blockName',
        10: 'x',
        11: 'x1',
        20: 'y',
        21: 'y1',
        40: 'r',
        50: 'a0',
        51: 'a1'
    };

    var counter = 0;
    var code = null;
    var isEntitiesSectionActive = false;
    var object = {};
    var svg = '';

    dxfString.split('\r\n').forEach(function(line) {
        line = line.trim();

        if (counter++ % 2 === 0) {
            code = parseInt(line);
        } else {
            var value = line;
            if (groupCodes[code] === 'blockName' && value === 'ENTITIES') {
                isEntitiesSectionActive = true;
            } else if (isEntitiesSectionActive) {
                if (groupCodes[code] === 'entityType') {
                    if (object.type) {
                        svg += dxfObjectToSvgSnippet(object) + '\n';
                    }

                    object = $.inArray(value, ['LINE', 'CIRCLE', 'ARC']) > -1 ? {type: value} : {};

                    if (value === 'ENDSEC') {
                        isEntitiesSectionActive = false;
                    }
                } else if (object.type && typeof groupCodes[code] !== 'undefined') {
                    object[groupCodes[code]] = parseFloat(value);
                }
            }
        }
    });

    var strokeWidth = 0.2;
    var svgId = "svg" + Math.round(Math.random() * Math.pow(10, 17));
    svg = '<svg {0} version="1.1" xmlns="http://www.w3.org/2000/svg">\n' +
          '<g transform="scale(1,-1)" ' +
            ' style="stroke:black; stroke-width:' + strokeWidth + '; ' +
                    'stroke-linecap:round; stroke-linejoin:round; fill:none">\n' +
          svg +
          '</g>\n' +
          '</svg>\n';

    // The SVG has to be added to the DOM to be able to retrieve its bounding box.
    $(svg.format('id="'+svgId+'"')).appendTo('body');
    var boundingBox = $('svg')[0].getBBox();
    var viewBoxValue = '{0} {1} {2} {3}'.format(boundingBox.x-strokeWidth/2, boundingBox.y-strokeWidth/2,
                                                boundingBox.width+strokeWidth, boundingBox.height+strokeWidth);
    $('#'+svgId).remove();

    return svg.format('viewBox="' + viewBoxValue + '"');
}
