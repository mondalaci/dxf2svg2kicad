$(document).ready(function() {
    "use strict";

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

    $('#upload-button').change(function() {
        var file = this.files[0];
        var filename = file.name;
        var lastDotPosition = filename.lastIndexOf('.');
        bareFilename = filename.substr(0, lastDotPosition);
        fileExtension = filename.substr(lastDotPosition+1).toLowerCase();

        $(new FileReader()).load(function(event) {
            var fileData = event.target.result;
            $('.save-link').hide();

            switch (fileExtension) {
                case 'dxf':
                    svgString = dxfToSvg(fileData);
                    $('#svg-and-kicad-pcb-save-links').show();
                    $('#invalid-extension').hide();
                    break;
                case 'svg':
                    svgString = fileData;
                    $('#kicad-pcb-save-link').show();
                    $('#invalid-extension').hide();
                    break;
                default:
                    $('#no-save-link').show();
                    $('#invalid-extension').show();
                    return;
            }

            $('#svg-image').remove();

            checkConvertedInputString(svgString);
            if (svgString === null) {
                return;
            }

            var dataUri = 'data:image/svg+xml;utf8,' + encodeURIComponent(svgString);
            var svgImage = $('<img>', {'id':'svg-image', src:dataUri});
            $('#svg-image-container').append(svgImage);

            kicadPcb = svgToKicadPcb(svgString, filename);
            checkConvertedInputString(kicadPcb);
        })[0].readAsText(file);
    });

    $('.save-svg-link').click(function() {
        if (fileExtension === 'svg' || !svgString) {
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

    function checkConvertedInputString(inputString)
    {
        if (inputString === null) {
            $('#invalid-input').show();
        } else {
            $('#invalid-input').hide();
        }
    }

    function saveStringAsFile(string, filename)
    {
        var blob = new Blob([string], {type: 'text/plain; charset=utf-8'});
        saveAs(blob, filename);
    }
});
