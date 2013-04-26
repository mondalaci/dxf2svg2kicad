kicad_pcb_template = '(kicad_pcb (version 3) (host pcbnew "%s")\n\
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


$(document).ready(function() {
    fileReader = new FileReader();
    fileReader2 = new FileReader();

    fileReader.onload = function(event) {
        $('#svgImage')[0].src = event.target.result;
    };

    fileReader2.onload = function(event) {
        var svgString = event.target.result;
        var svgDoc = $.parseXML(svgString);
        var svgDom = $(svgDoc);
        var objects = '';

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

        var kicad_pcb = _(kicad_pcb_template).sprintf(filename, objects);
        console.log(kicad_pcb);
        var blob = new Blob([kicad_pcb], {type: "text/plain;charset=utf-8"});
        saveAs(blob, filename+'.kicad_pcb');
    };

    $('#svgUploadButton').change(function(event) {
        var file = $('#svgUploadButton')[0].files[0];
        filename = file.name;
        fileReader.readAsDataURL(file);
        fileReader2.readAsText(file);
    });
});
