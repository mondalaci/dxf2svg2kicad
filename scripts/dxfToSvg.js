function dxfToSvg(dxfString)
{
    function dxfObjectToSvgSnippet(dxfObject)
    {
        function deg2rad(deg)
        {
            return deg * (Math.PI/180);
        }

        switch (dxfObject.type) {
            case 'LINE':
                return _('<path d="M%s,%s L%s,%s"/>').sprintf(dxfObject.x, dxfObject.y, dxfObject.x1, dxfObject.y1);
            case 'CIRCLE':
                return _('<circle cx="%s" cy="%s" r="%s"/>').sprintf(dxfObject.x, dxfObject.y, dxfObject.r);
            case 'ARC':
                var x1 = dxfObject.x + dxfObject.r * Math.cos(deg2rad(dxfObject.a0));
                var y1 = dxfObject.y + dxfObject.r * Math.sin(deg2rad(dxfObject.a0));
                var x2 = dxfObject.x + dxfObject.r * Math.cos(deg2rad(dxfObject.a1));
                var y2 = dxfObject.y + dxfObject.r * Math.sin(deg2rad(dxfObject.a1));
                return _('<path d="M%s,%s A%s,%s 0 1,1 %s,%s"/>').sprintf(x1, y1, dxfObject.r, dxfObject.r, x2, y2);
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
    }

    var counter = 0;
    var code = null;
    var entitiesSectionActive = false;
    var object = {};
    var svg = '';

    dxfString.split('\r\n').forEach(function(line) {
        line = line.trim();

        if (counter++ % 2 == 0) {
            code = parseInt(line);
        } else {
            var value = line;
            if (groupCodes[code] == 'blockName' && value == 'ENTITIES') {
                entitiesSectionActive = true;
            } else if (entitiesSectionActive) {
                if (groupCodes[code] == 'entityType') {
                    if (object.type) {
                        svg += dxfObjectToSvgSnippet(object) + '\n';
                    }

                    object = $.inArray(value, ['LINE', 'CIRCLE', 'ARC']) > -1 ? {type: value} : {};

                    if (value == 'ENDSEC') {
                        entitiesSectionActive = false;
                    }
                } else if (object.type && typeof groupCodes[code] != 'undefined') {
                    object[groupCodes[code]] = parseFloat(value);
                }
            }
        }
    });

    return '<svg viewBox="31.385 -229.628 152.9 125.4" version="1.1" xmlns="http://www.w3.org/2000/svg">\n' +
            '<g transform="scale(1,-1)" ' +
            'style="stroke:black; stroke-width:0.2; stroke-linecap:round; stroke-linejoin:round; fill:none">\n'
            + svg +
            '</g>\n' +
            '</svg>\n';
}
