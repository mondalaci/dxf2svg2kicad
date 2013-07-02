$(document).ready(function() {
    $('#uploadButton').change(function(event) {
        var file = $('#uploadButton')[0].files[0];
        var baseFilename = file.name;
        var lastDotPosition = baseFilename.lastIndexOf('.');
        var bareFilename = baseFilename.substr(0, lastDotPosition);
        var fileExtension = baseFilename.substr(lastDotPosition+1);

        $(new FileReader()).load(function(event) {
            var fileData = event.target.result;
            var svgString = fileExtension.toLowerCase() == 'dxf' ? dxfToSvg(fileData) : fileData;
            $('#svgImage')[0].src = 'data:image/svg+xml;utf8,' + svgString;
            var kicadPcb = svgToKicadPcb(svgString, baseFilename);
            var blob = new Blob([kicadPcb], {type: 'text/plain; charset=utf-8'});
            saveAs(blob, baseFilename+'.kicad_pcb');
        })[0].readAsText(file);
    });
});
