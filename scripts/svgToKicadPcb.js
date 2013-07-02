function svgToKicadPcb(svgString, baseFilename)
{
    var kicadPcbTemplate = '(kicad_pcb (version 3) (host pcbnew "%s")\n\
\n\
  (general\n\
    (links 0)\n\
    (no_connects 0)\n\
    (area 0 0 0 0)\n\
    (thickness 1.6)\n\
    (drawings 5)\n\
    (tracks 0)\n\
    (zones 0)\n\
    (modules 0)\n\
    (nets 1)\n\
  )\n\
\n\
  (page A3)\n\
  (layers\n\
    (15 F.Cu signal)\n\
    (0 B.Cu signal)\n\
    (16 B.Adhes user)\n\
    (17 F.Adhes user)\n\
    (18 B.Paste user)\n\
    (19 F.Paste user)\n\
    (20 B.SilkS user)\n\
    (21 F.SilkS user)\n\
    (22 B.Mask user)\n\
    (23 F.Mask user)\n\
    (24 Dwgs.User user)\n\
    (25 Cmts.User user)\n\
    (26 Eco1.User user)\n\
    (27 Eco2.User user)\n\
    (28 Edge.Cuts user)\n\
  )\n\
\n\
  (setup\n\
    (last_trace_width 0.254)\n\
    (trace_clearance 0.254)\n\
    (zone_clearance 0.508)\n\
    (zone_45_only no)\n\
    (trace_min 0.254)\n\
    (segment_width 0.2)\n\
    (edge_width 0.1)\n\
    (via_size 0.889)\n\
    (via_drill 0.635)\n\
    (via_min_size 0.889)\n\
    (via_min_drill 0.508)\n\
    (uvia_size 0.508)\n\
    (uvia_drill 0.127)\n\
    (uvias_allowed no)\n\
    (uvia_min_size 0.508)\n\
    (uvia_min_drill 0.127)\n\
    (pcb_text_width 0.3)\n\
    (pcb_text_size 1.5 1.5)\n\
    (mod_edge_width 0.15)\n\
    (mod_text_size 1 1)\n\
    (mod_text_width 0.15)\n\
    (pad_size 1.5 1.5)\n\
    (pad_drill 0.6)\n\
    (pad_to_mask_clearance 0)\n\
    (aux_axis_origin 0 0)\n\
    (visible_elements FFFFF77F)\n\
    (pcbplotparams\n\
      (layerselection 3178497)\n\
      (usegerberextensions true)\n\
      (excludeedgelayer true)\n\
      (linewidth 152400)\n\
      (plotframeref false)\n\
      (viasonmask false)\n\
      (mode 1)\n\
      (useauxorigin false)\n\
      (hpglpennumber 1)\n\
      (hpglpenspeed 20)\n\
      (hpglpendiameter 15)\n\
      (hpglpenoverlay 2)\n\
      (psnegative false)\n\
      (psa4output false)\n\
      (plotreference true)\n\
      (plotvalue true)\n\
      (plotothertext true)\n\
      (plotinvisibletext false)\n\
      (padsonsilk false)\n\
      (subtractmaskfromsilk false)\n\
      (outputformat 1)\n\
      (mirror false)\n\
      (drillshape 1)\n\
      (scaleselection 1)\n\
      (outputdirectory ""))\n\
  )\n\
\n\
  (net 0 "")\n\
\n\
  (net_class Default "This is the default net class."\n\
    (clearance 0.254)\n\
    (trace_width 0.254)\n\
    (via_dia 0.889)\n\
    (via_drill 0.635)\n\
    (uvia_dia 0.508)\n\
    (uvia_drill 0.127)\n\
    (add_net "")\n\
  )\n\
\n\
%s\n\
)\n\
';

    function getArcFromPath(path)
    {
        function cartesianToPolar(cartesian) {
            return {
                r: Math.sqrt(Math.pow(cartesian.x, 2) + Math.pow(cartesian.y, 2)),
                t: Math.atan2(cartesian.y, cartesian.x)
            };
        }

        function polarToCartesian(polar) {
            return {x:polar.r*Math.cos(polar.t), y:polar.r*Math.sin(polar.t)};
        }

        var segments = path.pathSegList;

        if (!(segments.numberOfItems == 2 &&
              segments.getItem(0).pathSegType == SVGPathSeg.PATHSEG_MOVETO_ABS &&
              segments.getItem(1).pathSegType == SVGPathSeg.PATHSEG_ARC_ABS &&
              segments.getItem(1).r1 == segments.getItem(1).r2))
        {
            return '';  // Path type is not supported by KiCad.
        }

        var move = segments.getItem(0);
        var arc = segments.getItem(1);

        var halfPathLength = path.getTotalLength() / 2;
        var middlePathPoint = path.getPointAtLength(halfPathLength);

        // Compute distances between points using use Pythagoras' theorem explained at
        // http://en.wikipedia.org/wiki/Pythagorean_theorem
        var startToHalfDistance = Math.sqrt(Math.pow(Math.abs(move.x-middlePathPoint.x), 2) +
                                            Math.pow(Math.abs(move.y-middlePathPoint.y), 2));
        var startToEndVector = {x:arc.x-move.x, y:arc.y-move.y};
        var startToEndDistance = Math.sqrt(Math.pow(Math.abs(startToEndVector.x), 2) +
                                           Math.pow(Math.abs(startToEndVector.y), 2));

        // Compute angle based on all the sides using the Law of Sines explained at
        // http://math.stackexchange.com/questions/106539/solving-triangles-finding-missing-sides-angles-given-3-sides-angles
        var alphaRadian = Math.acos((2*Math.pow(startToHalfDistance, 2) - Math.pow(startToEndDistance, 2)) /
                                     2*startToHalfDistance*startToHalfDistance);

        var arcAngleRadian = 2*(Math.PI - alphaRadian);
        var arcAngleDegrees = (180/Math.PI) * arcAngleRadian;
        var startToEndPolarVector = cartesianToPolar(startToEndVector);
        var halfToCenterPolarVector = {r:arc.r1, t:startToEndPolarVector.t + Math.PI/2};
        var halfToCenterCartesianVector = polarToCartesian(halfToCenterPolarVector);
        var centerPoint = {
            x: middlePathPoint.x + halfToCenterCartesianVector.x,
            y: middlePathPoint.y + halfToCenterCartesianVector.y
        };

        return _('  (gr_arc (start %f %f) (end %f %f) (angle %f) (layer Edge.Cuts) (width 0.1))\n').
                 sprintf(centerPoint.x, -centerPoint.y, move.x, -move.y, -arcAngleDegrees);
    }

    var svgDoc = $.parseXML(svgString);
    var svgDom = $(svgDoc);
    var objects = '';

    // Negate y coordinates because SVG increases upwards while KiCad increases downwards.

    svgDom.find('line').each(function(index, line) {
        objects += _('  (gr_line (start %f %f) (end %f %f) (angle 90) (layer Edge.Cuts) (width 0.1))\n').
                   sprintf(line.x1.baseVal.value, -line.y1.baseVal.value,
                           line.x2.baseVal.value, -line.y2.baseVal.value);
    });

    svgDom.find('circle').each(function(index, circle) {
        objects += _('  (gr_circle (center %f %f) (end %f %f) (layer Edge.Cuts) (width 0.1))\n').
                   sprintf(circle.cx.baseVal.value, -circle.cy.baseVal.value,
                           circle.cx.baseVal.value, -circle.cy.baseVal.value+circle.r.baseVal.value);
    });

    svgDom.find('path').each(function(index, path) {
        objects += getArcFromPath(path);
    });

    return _(kicadPcbTemplate).sprintf(baseFilename, objects);
}
