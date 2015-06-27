$(document).ready(function() {
    "use strict";

    var bareFilename = null;
    var fileExtension = null;
    var filename = null;
    var svgString = null;
    var kicadPcb = null;
    var kicadPcbToBeAppended = null;

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

    var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    if (isFirefox) {
        $('.firefox-notification').show();
    }

    $('#input-file-chooser').change(function() {
        var file = this.files[0];
        filename = file.name;
        var lastDotPosition = filename.lastIndexOf('.');
        bareFilename = filename.substr(0, lastDotPosition);
        fileExtension = filename.substr(lastDotPosition+1).toLowerCase();

        $(new FileReader()).load(function(event) {
            var fileData = event.target.result;
            $('.save-link').hide();

            switch (fileExtension) {
                case 'dxf':
                    svgString = dxfToSvg(fileData);
                    $('#svg-and-kicad-pcb-save-links, #dxf-help').show();
                    $('#invalid-extension, #svg-help').hide();
                    break;
                case 'svg':
                    svgString = fileData;
                    $('#kicad-pcb-save-link, #svg-help').show();
                    $('#invalid-extension, #dxf-help').hide();
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
            var svgImage = $('<img>', {id:'svg-image', src:dataUri});
            $('#svg-image-container').append(svgImage);

            kicadPcb = svgToKicadPcbGetter(svgString);
            checkConvertedInputString(kicadPcb);
        })[0].readAsText(file);
    });

    $('#appended-file-chooser').change(function() {
        var file = this.files[0];
        $(new FileReader()).load(function(event) {
            var fileData = event.target.result;
            fileData = _.trim(fileData);

            var isFileValid = _(fileData).startsWith('(kicad_pcb ') && _(fileData).endsWith(')');
            if (isFileValid) {
                kicadPcbToBeAppended = fileData.substr(0, fileData.length-1);
                $('#invalid-append-file').hide();
            } else {
                kicadPcbToBeAppended = null;
                $('#invalid-append-file').show();
            }
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
        kicadPcb = svgToKicadPcbGetter(svgString);
        saveStringAsFile(kicadPcb, bareFilename+'.kicad_pcb');
    });

    $('#advanced-options-link').click(function() {
        $("#advanced-options").show();
        $("#advanced-options-expander").hide();
    });

    $('#translation-x, #translation-y').change(function() {
        var id = this.id;
        var value = parseFloat($('#'+id).val());
        if (isNaN(value)) {
            $('#invalid-input-'+id).show();
        } else {
            $('#invalid-input-'+id).hide();
        }
    });

    $('#report-link').click(function() {
        $("#report-help").show();
    });

    $('#donate-link').click(function() {
        $("#paypal-submit").trigger("click");
        return false;
    });

    function svgToKicadPcbGetter(svgString)
    {
        var translationX = parseFloat($('#translation-x').val());
        if (isNaN(translationX)) {
            translationX = 0;
        }

        var translationY = parseFloat($('#translation-y').val());
        if (isNaN(translationY)) {
            translationY = 0;
        }

        var layer = $('#layer').val();

        return svgToKicadPcb(svgString, filename, layer, translationX, translationY, kicadPcbToBeAppended, fileExtension === 'dxf');
    }

    function checkConvertedInputString(inputString)
    {
        if (inputString === null) {
            $('#invalid-input-file').show();
        } else {
            $('#invalid-input-file').hide();
        }
    }

    function saveStringAsFile(string, filename)
    {
        var blob = new Blob([string], {type: 'text/plain; charset=utf-8'});
        saveAs(blob, filename);
    }
});
