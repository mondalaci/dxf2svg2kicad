"use strict";

$(document).ready(function() {
    var bareFilename = null;
    var fileExtension = null;
    var svgString = null;
    var kicadPcb = null;

    var requiredFeatures = ['svg', 'inlinesvg', 'blobconstructor', 'filereader'];
    var missingFeatures = [];
    requiredFeatures.forEach(function(feature) {
        if (!Modernizr[feature]) {
            missingFeatures.append(feature);
        }
    });
    missingFeatures = missingFeatures.join(', ');

    if (missingFeatures) {
        $('.upgrade-browser-notification').show();
        $('#missing-features').html(missingFeatures);
    }

    $('#upload-button').change(function(event) {
        var file = this.files[0];
        var baseFilename = file.name;
        var lastDotPosition = baseFilename.lastIndexOf('.');
        bareFilename = baseFilename.substr(0, lastDotPosition);
        fileExtension = baseFilename.substr(lastDotPosition+1).toLowerCase();

        $(new FileReader()).load(function(event) {
            var fileData = event.target.result;
            $('.save-link').hide();
            switch (fileExtension) {
                case 'dxf':
                    svgString = dxfToSvg(fileData);
                    $('#svg-and-kicad-pcb-save-links').show();
                    break;
                case 'svg':
                    svgString = fileData;
                    $('#kicad-pcb-save-link').show();
                    break;
                default:
                    $('#no-save-link').show();
                    return;
            }
            $('#svg-image')[0].src = 'data:image/svg+xml;utf8,' + svgString;
            kicadPcb = svgToKicadPcb(svgString, baseFilename);
        })[0].readAsText(file);
        $('#dxf-input').show();
    });

    $('.save-svg-link').click(function() {
        if (fileExtension == 'svg' || !svgString) {
            return;
        }
        saveStringAsFile(svgString, bareFilename+'.svg');
    });

    $('.save-kicad-pcb-link').click(function() {
        if (!kicadPcb) {
            return;
        }
        saveStringAsFile(kicadPcb, bareFilename+'.kicad_pcb');
    });

    $('#report-link').click(function() {
        $("#report-help").show();
    });

    $('#donate-link').click(function() {
        $("#paypal-submit").trigger("click");
        return false;
    });

    function saveStringAsFile(string, filename)
    {
        var blob = new Blob([string], {type: 'text/plain; charset=utf-8'});
        saveAs(blob, filename);
    }
});
