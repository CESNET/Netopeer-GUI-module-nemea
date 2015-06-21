$(function() {
    initModuleDefaultJS()
});

function initModuleDefaultJS() {
    initNemea();
    loadGUI();
}

var graph,
    paper,
    graphMenu,
    paperMenu,
    state,
    theEnd,
    testModule,
    y,
    pathArray,
    selected;

function initNemea() {
    $('#info-panel').addClass("display-none");

    //paper and graph as whiteboard
        graph = new joint.dia.Graph;
        paper = new joint.dia.Paper({
            el: $('#graph'),
            gridSize: 1,
            model: graph,
            validateConnection: function(cellViewS, magnetS, cellViewT, magnetT, end, linkView) {
				// Prevent linking from input ports.
				//if (magnetS && magnetS.getAttribute('type') === 'input') return false;
				// Prevent linking from output ports to input ports within one element.
				if (cellViewS === cellViewT) return false;
				// Prevent linking to input ports.
				return magnetT && magnetT.getAttribute('type') === 'input';
            },
            // Enable marking available cells & magnets
            //markAvailable: true
        });


    //paper and graph as menu
        graphMenu = new joint.dia.Graph;
        paperMenu = new joint.dia.Paper({
            el: $('#menu'),
            interactive: false,
            model: graphMenu,
        });

        state = "start";
      

    //default modul
    theEnd = new joint.shapes.devs.Model({
        size: {width: 100, height: 60},  
            attrs: {
                rect: {fill: '#2ECC71'},
                '.inPorts circle': {fill: '#16A085', magnet: 'passive', type: 'input'},
                '.outPorts circle': {fill: '#E74C3C', type: 'output'}
            }
    });
    testModule = new joint.shapes.devs.Model({
        size: {width: 100, height: 60},
        attrs: {
            rect: {fill: '#2ECC71'},
            '.inPorts circle': {fill: '#16A085', magnet: 'passive', type: 'input'},
            '.outPorts circle': {fill: '#E74C3C', type: 'output'}
        }
    });

    paperMenu.on('cell:pointerdblclick',
            function(cellView, evt, x, y) {
                var hlp = cellView.model.clone();
                graph.addCell(hlp);
            });

    paperMenu.on('cell:mouseover',
            function(cellView, evt) {
                $('#info-panel').removeClass("display-none");
                $('#info-input').text(cellView.model.prop("description"));
                $('#info-panel').addClass("display");
            });
    paperMenu.on('cell:mouseout',
            function(cellView, evt) {
                $('#info-input').text("");
                $('#info-panel').removeClass("display");
                $('#info-panel').addClass("display-none");
            });

// origin position
    y = 0;
    pathArray = [];
    $('#nemeaGUI-reload').click(function() {
		state = "remove";
		graph.clear();
		graphMenu.clear();
		loadGUI();
	});
	$('#nemeaGUI-remove').click(function() {
		state = "remove";
		graph.clear();
		graphMenu.clear();
		state = "start";
	});
    $('#nemeaGUI-Save').click(function() {
        var xml = "<?xml version='1.0' encoding='UTF-8'?><nemea-supervisor><available-modules><search-paths>";
        var GUIMenuElements = graphMenu.getElements();
		
        _.each(pathArray, function(path, i) {
            xml += "<path>" + escapeHtml(path) + "</path>";
        });
        xml += "</search-paths><modules>";
        _.each(GUIMenuElements, function(GUIMenuElement, i) {
            xml += "<module>";
            xml += "<name>" + escapeHtml(GUIMenuElement.prop("name")) + "</name>";
            xml += "<description>" + escapeHtml(GUIMenuElement.prop("description")) + "</description>";
            xml += "<number-out-ifc>" + escapeHtml(GUIMenuElement.prop("numberOutIfc")) + "</number-out-ifc>";
            xml += "<number-in-ifc>" + escapeHtml(GUIMenuElement.prop("numberInIfc")) + "</number-in-ifc>";
            xml += "<parameter>";

            var GUIMenuParameters = GUIMenuElement.prop("parameters");
            _.each(GUIMenuParameters, function(parameter, j) {
                xml += "<" + escapeHtml(parameter.name) + ">" + escapeHtml(parameter.text) + "</" + parameter.name + ">";
            });
            xml += "</parameter></module>"
        });

        xml += "</modules></available-modules><modules>";

        var GUIElements = graph.getElements();
        _.each(GUIElements, function(GUIElement, i) {

            xml += "<module>";
            xml += "<name>" + escapeHtml(GUIElement.prop("name")) + "</name>";
            xml += "<enabled>" + escapeHtml(GUIElement.prop("enabled")) + "</enabled>";
            xml += "<path>" + escapeHtml(GUIElement.prop("path")) + "</path>";
            xml += "<params>" + escapeHtml(GUIElement.prop("params")) + "</params>";
            xml += "<trapinterfaces>";

            var GUIInterface = GUIElement.prop("interface");
            _.each(GUIInterface, function(interface, j) {
                xml += "<interface>";
                xml += "<note>" + escapeHtml(interface.note) + "</note>";
                xml += "<type>" + escapeHtml(interface.type) + "</type>";
                xml += "<direction>" + escapeHtml(interface.direction) + "</direction>";
                xml += "<params>" + escapeHtml(interface.params) + "</params>";
                xml += "</interface>";
            });
            xml += "</trapinterfaces></module>";
        });

        xml += "</modules></nemea-supervisor>";

		var formAction = window.location.href;
        var myData = {configXML: {'myXml': xml}};

		//Tady je Ajax request
        $.ajax({
			url: formAction,
			data: myData,
            method: 'POST',
			success: function(data) {
				var JSONdata = JSON.parse(data);
				console.log(JSONdata.myXml)
				$("#test").empty();
				$("#test").text("ok")
			},
			error: function() {
				$("#test").empty();
				$("#test").append("error");
			}
		});
        //send xml to PHP
        //$('#test').empty();
        //$('#JSON').text(xml);
        //
    });

    $('#nemeaGUI-layout').click(function() {
        layout();
    });



    selected = [];
    paper.on('cell:pointerdown',
            function(cellView, evt, x, y) {
                cellView.model.attr({
                    rect: {fill: 'blue'}
                });
            });
    paper.on('cell:pointerclick',
            function(cellView, evt, x, y) {
                if (selected.length !== 0) {
                    if (event.ctrlKey) {
                        selected.push(cellView.model);
                        cellView.model.attr({
                            rect: {fill: 'yellow'}
                        });
                    }
                    else {
                        for (var i = 0; i < selected.length; i++) {
                            if (!(selected[i] instanceof joint.dia.Link)) {
                                selected[i].attr({
                                    rect: {fill: '#2ECC71'}
                                });
                            } else {
                                selected[i].attr({
                                    rect: {fill: 'black'}
                                });
                            }
                        }
                        selected = [];
                        cellView.model.attr({
                            rect: {fill: 'yellow'}
                        });
                        selected.push(cellView.model);
                    }
                } else {
                    selected.push(cellView.model);

                    cellView.model.attr({
                        rect: {fill: 'yellow'}
                    });
                }
            });
    paper.on('blank:pointerdown',
            function(evt, x, y) {
                for (var i = 0; i < selected.length; i++) {
                    if (!(selected[i] instanceof joint.dia.Link)) {
                        selected[i].attr({
                            rect: {fill: '#2ECC71'}
                        });
                    } else {
                        selected[i].attr({
                            rect: {fill: 'black'}
                        });
                    }
                }
                selected = [];
            });

    paper.on('cell:pointerup',
            function(cellView, evt, x, y) {
                if (!(cellView.model instanceof joint.dia.Link)) {
                    cellView.model.attr({
                        rect: {fill: '#2ECC71'}
                    });
                } else {
                    cellView.model.attr({
                        rect: {fill: 'black'}
                    });
                }
            });
    paper.on('cell:pointerdblclick',
            function(cellView, evt, x, y) {
                var onPaper = cellView.model.prop('paper');
                /*if (onPaper === "on") {
                    $('.change').prop('readonly', true);
                    $('.change').addClass('non-modify');
                } else {
                    $('.change').prop('readonly', false);
                    $('.change').removeClass('non-modify');
                }*/
                $('#' + cellView.model.id).dialog("option", "width", 500, "height", 500);
                $('#' + cellView.model.id).dialog('open');
            });
            
    graph.on('add', function(cell) {
        if(state == "repair"){
            return;
        }
        if (!(cell instanceof joint.dia.Link)) {
            $('#nemeagui').prepend('<div id=' + cell.id + ' title=' + cell.prop("name") + '><fieldset id="fieldset' + cell.id + '" class="nemeaGUI-fieldset"></fieldset></div>');
            $('#' + cell.id).dialog({
                autoOpen: false,
                resizable: false,
                height: 500,
                modal: true,
                buttons: {
                    "Save": function() {
                        var inPorts = cell.get('inPorts');
                        var outPorts = cell.get('outPorts');
                        if(inPorts.length > outPorts.length){
                            var max = inPorts.length;
                        }else
                            var max = outPorts.length;
                        if(max > 12){  
                            cell.resize(100,180);
                        }else if(max > 8){
                            cell.resize(100,150);
                        }else if(max > 6){
                            cell.resize(100,120);
                        }else if(max > 4){
                            cell.resize(100,90);
                        }
                        var onPaper = cell.prop('paper');
                        var newName = $('#nameInput' + cell.id).val();
                        if (newName === "") {
                            alert("Fill field name");
                            return false;
                        }
                        if (!isNameFree(newName) && newName !== cell.prop('name') && onPaper == "on") {
                            alert("This name already exists in Graf");
                            return false;
                        }
                        if (!isNameFree(newName) && onPaper == "off") {
                            alert("This name already exists in Graf");
                            return false;
                        }
                        var newParams = $('#paramsInput' + cell.id).val();
                        var newEnabled = $('#enabled' + cell.id).val();
                        if(newEnabled === "False"){
							//add class
							/*cell.attr({
								rect: {fill: 'grey'}
							});*/
						}
                        var newPath = $('#pathInput' + cell.id).val();
                        var interfaces = cell.prop("interface");
                        for (var i = 0; i < interfaces.length; i++) {
                            if (interfaces[i].type === "SERVICE")
                                continue;

                            var newNote = $('#intNote' + cell.id + interfaces[i].number).val();
                            interfaces[i].note = newNote;
                            var newType = $('#sel' + cell.id + interfaces[i].number).val();
                            if (interfaces[i].type !== newType) {
                                //disconnect all links when type is changed 
                                removeLinks(cell, interfaces[i].number);
                                interfaces[i].type = newType;
                                var smthg = i.toString();
                                if (interfaces[i].direction === "OUT") {
                                    if (interfaces[i].type === "TCP")
                                        cell.attr('[port="' + smthg + '"]/fill', '#E7CCCC');
                                    else
                                        cell.attr('[port="' + smthg + '"]/fill', '#E74C3C');
                                }
                            }
                            var intParam = $('#paramIntInput' + cell.id + interfaces[i].number).val();
                            if (interfaces[i].direction === "OUT" && intParam === "") {
                                alert("Output interface has to have params");
                                return false;
                            } else {
                                
                            } 
                            if (interfaces[i].direction === "IN" && intParam !== interfaces[i].params) {
                                removeLinks(cell, interfaces[i].number);
                                interfaces[i].params = intParam;
                            } else {
								interfaces[i].params = intParam;
                                //interfaces[i].params = "";
                            }
                            var newIntParam = $('#paramIntInput' + cell.id + interfaces[i].number).val();
                            if(interfaces[i].params !== newIntParam){
                                removeLinks(cell, interfaces[i].number);
                                interfaces[i].params = newIntParam; 
                            }
                            if (interfaces[i].direction === "OUT") {
                                var ArrayCompareParams = interfaces[i].params.split(",");
                                var compareParam;

                                // localhost,compareParam,params || localhost,compareParam
                                if (interfaces[i].type !== "SERVICE" && (ArrayCompareParams.length === 3 || ArrayCompareParams.length === 2))
                                    compareParam = ArrayCompareParams[1];
                                // compareParam
                                else if (interfaces[i].type !== "SERVICE" && ArrayCompareParams.length === 1)
                                    compareParam = ArrayCompareParams[0];
                                else
                                    compareParam = -1; //magic variable hahaahah

                                interfaces[i].compareParam = compareParam;
                            }

                        }
                        cell.prop('name', newName);
                        cell.prop('params', newParams);
                        cell.prop('enabled', newEnabled);
                        cell.prop('path', newPath);
                        cell.prop('paper', 'on');
                        var nameLabel = newName.substring(0, 12);
                        cell.attr({
                            '.label': {text: nameLabel}
                        });
                        layout();
                        $(this).dialog("close");
                    },
                    Cancel: function() {
                        var onPaper = cell.prop('paper');
                        if (onPaper === "off") {
                            cell.remove();
                            layout();
                        }
                        $(this).dialog("close");
                    }
                }
            });

            var name = cell.prop("name");
            //$('#' + cell.id).append(cell.id);
            $('#fieldset' + cell.id).append("<label for=nameInput>*name: </label><input type='text' name='nameInput" + cell.id + "' id='nameInput" + cell.id + "' value='" + name + "'>");
            var params = cell.prop("params");
            $('#fieldset' + cell.id).append("<label for=paramsInput>params: </label><input type='text' name='paramsInput" + cell.id + "' id='paramsInput" + cell.id + "' value='" + params + "'>");
            $('#fieldset' + cell.id).append("<div><label for=pathInput>path: </label><input type='text' name='pathInput" + cell.id + "' id='pathInput" + cell.id + "' value=''>"
                    + "<label for=enabled>enabled: </label><select name='enabled' id='enabled" + cell.id + "'>"
                    + "<option value='True'>True</option>"
                    + "<option value='False'>False</option>"
                    + "</select></div><br>");

            var interface = cell.prop("interface");
            for (var i = 0; i < interface.length; i++) {
                var intID = cell.id + interface[i].number + "";
                if (interface[i].type === "SERVICE")
                    continue;
                $('#fieldset' + cell.id).append("<br><label for=IntNumber>Interface:  </label><input name='IntNumber' id='IntNumber" + intID + "' value='" + interface[i].number + "' class='non-modify' readOnly><br>");
                $('#fieldset' + cell.id).append("<label for=intNote>note: </label><input type='text' name='intNote" + intID + "' id='intNote" + intID + "' value='" + interface[i].note + "'>");
                $('#fieldset' + cell.id).append("<label for=enabled>type:  </label><select name='enabled' id='sel" + intID + "'>"
                            + "<option value='UNIXSOCKET'>UNIXSOCKET</option>"
                            + "<option value='TCP'>TCP</option>"
                            + "</select><br>");
               
                $('#fieldset' + cell.id).append("<label for=IntDirection>direction:  </label><input name='IntDirection' id='InterfaceInDirection" + intID + "' value='" + interface[i].direction + "' class='non-modify' readOnly><br>");
                if(interface[i].direction == "OUT"){
					$('#fieldset' + cell.id).append("<label for=paramIntInput: >*params:</label>");
					$('#fieldset' + cell.id).append("<input type='text' name='paramIntInput' id='paramIntInput" + intID + "' value='" + interface[i].params + "'>" + "<br>");
				}else{
					$('#fieldset' + cell.id).append("<label for=paramIntInput: >params:</label>");
					$('#fieldset' + cell.id).append("<input type='text' name='paramIntInput' id='paramIntInput" + intID + "' value='" + interface[i].params + "'>" + "<br>");
				}
                $("#sel" + cell.id + interface[i].number).val(interface[i].type);

                //zmena barvy portu
                var smthg = i.toString();
                if (interface[i].direction === "OUT") {
                    if (interface[i].type === "TCP")
                        cell.attr('[port="' + smthg + '"]/fill', '#E7CCCC');
                    else
                        cell.attr('[port="' + smthg + '"]/fill', '#E74C3C');
                }
            }
            if (state == "modify") {
                var onPaper = cell.prop('paper');
                $('#' + cell.id).dialog("option", "width", 500, "height", 500);
                $('#' + cell.id).dialog('open');
                layout();
            }
        } else {
            cell.attr({
                '.marker-target': {fill: 'yellow', d: 'M 10 0 L 0 5 L 10 10 z'}
            });
            if (state == "modify") {

                var sourceModule = getModuleByID(cell.get('source').id);
                var sourceInterface = sourceModule.prop("interface");
                //alert(interface);

                var interfaceS = getInterfaceByNumber(sourceInterface, cell.get('source').port);
                // $('#JSON').prepend(interface.compareParam);
                cell.label(0, {
                    position: .5,
                    attrs: {
                        rect: {fill: 'black'},
                        text: {fill: 'white', text: interfaceS.compareParam}
                    }
                });
            }
            cell.on('change:target', function() {
                if (cell.get('target').id) {

                    var targetModule = getModuleByID(cell.get('target').id);

                    var targetInterface = targetModule.prop("interface");
                    var interfaceT = getInterfaceByNumber(targetInterface, cell.get('target').port);

                    //var interfaceT = getInterfaceByNumber(targetInterface,cell.get('target').port);
                    if (!isPortFree(targetModule, cell.get('target').port)) {
                        alert("Input interface can have only one connection at the same time");
                        cell.remove();
                    } else {
                        setInterfaceTypeByNumber(targetInterface, cell.get('target').port, interfaceS.type);
                        $("#sel" + cell.get('target').id + interfaceT.number).val(interfaceS.type);
                        $("#paramIntInput" + cell.get('target').id + interfaceT.number).val(interfaceS.params);
                        $("#InterfaceInType" + cell.get('target').id + interfaceT.number).val(interfaceS.type);
                        setInterfaceParamByNumber(targetInterface, cell.get('target').port, interfaceS.params);
                        //alert(interfaceT);
                    }
                }
            });
        }
    });
    graph.on('remove', function(cell) {
        if ((cell instanceof joint.dia.Link) && state !=="remove") {
            if (cell.get('target').id) {
                var targetModule = getModuleByID(cell.get('target').id);
                var targetInterface = targetModule.prop("interface");
                var interfaceT = getInterfaceByNumber(targetInterface, cell.get('target').port);
                setInterfaceParamByNumber(targetInterface, cell.get('target').port, "");
                var newID = cell.get('target').id + interfaceT.number;
                $('#paramIntInput' + newID).val("");
            }
        }
    });
    $('html').keyup(function(e) {
        if (e.keyCode == 46) {
            for (var i = 0; i < selected.length; i++) {
                selected[i].remove();
            }
        }
    });
}

//buttom for testing
    function loadAvailableModules(xmlDoc) {
		 
       // var xmlDoc = loadXMLDoc("./dns_valid.xml");
        var available = xmlDoc.getElementsByTagName('available-modules')[0];

        if (typeof available === "undefined") {
            intArray = [];
            intArray[0] = {
                    note: "",
                    name: "nameIN",
                    number: "0",
                    type: "UNIXSOCKET",
                    direction: "IN",
                    params: "",
                    compareParam: ""
                };
            setInPorts = "0";
            theEnd.prop('description', 'konec');


            theEnd.prop('params', '');
            theEnd.prop('numberOutIfc', '0');
            theEnd.prop('numberInIfc', '1');
            theEnd.prop('parameters', '');
            theEnd.prop('name', 'end');
            theEnd.prop('enabled', 'true');
            theEnd.prop('path', '');
            theEnd.prop('paper', 'off');
            theEnd.attr({
                '.label': {text: 'repair-end'}
            });
            theEnd.prop('interface', intArray);
            theEnd.set('inPorts', setInPorts);
            graphMenu.addCell(theEnd);
            return;
        }
        var searchPaths = xmlDoc.getElementsByTagName('search-paths')[0];
        if (typeof searchPaths === "undefined") {
            alert("XML element searchPath is missing");
        }
        var paths = searchPaths.getElementsByTagName('path');
        for (var j = 0; j < paths.length; j++) {
            if (typeof paths[j].childNodes[0] !== "undefined") {
                pathArray[j] = paths[j].childNodes[0].nodeValue;
            } else {
                pathArray[j] = "";
            }

        }

        var parent = xmlDoc.getElementsByTagName('modules')[0];
        if (typeof parent === "undefined") {
            alert("XML Element modules is missing");
        }
        var module = parent.getElementsByTagName('module');

        var GUIModuleArray = [];
        var ModuleArray = [];

        for (var j = 0; j < module.length; j++) {
            GUIModuleArray[j] = testModule.clone();
            var name = module[j].getElementsByTagName('name')[0];
            if (typeof name !== "undefined" && typeof name.childNodes[0] !== "undefined") {
                name = name.childNodes[0].nodeValue;
            } else {
                name = "";
            }

            var description = module[j].getElementsByTagName('description')[0];
            if (typeof description !== "undefined" && typeof description.childNodes[0] !== "undefined") {
                description = description.childNodes[0].nodeValue;
            } else {
                description = "Ndescription was not found";
            }

            var numberOutIfc = module[j].getElementsByTagName('number-out-ifc')[0];
            if (typeof numberOutIfc !== "undefined" && typeof numberOutIfc.childNodes[0] !== "undefined") {
                numberOutIfc = numberOutIfc.childNodes[0].nodeValue;
            } else {
                numberOutIfc = 0;
            }

            var numberInIfc = module[j].getElementsByTagName('number-in-ifc')[0];
            if (typeof numberInIfc !== "undefined" && typeof numberInIfc.childNodes[0] !== "undefined") {
                numberInIfc = numberInIfc.childNodes[0].nodeValue;
            } else {
                numberInIfc = 0;
            }


            var parameter = xmlDoc.getElementsByTagName('parameter')[0].childNodes;
            if (typeof parameter === "undefined" && typeof numberInIfc.childNodes !== "undefined") {
                alert("XML Element parameter is missing");
            }


            var parameters = [];
            var index = 0;
            //var parameter = parameter.getElementsByTagName('module');
            for (var i = 0; i < parameter.length; i++) {
                //skip non elements nodes from xml
                if (parameter[i].nodeType !== 1)
                    continue;

                parameters[index] = {
                    name: parameter[i].nodeName,
                    text: parameter[i].childNodes[0].nodeValue
                };
                index++;
            }

            var setInPorts = [];
            var setOutPorts = [];
            var intArray = [];
            numberOutIfc = parseInt(numberOutIfc);
            numberInIfc = parseInt(numberInIfc);
            for (var i = 0; i < numberInIfc; i++) {
                intArray[i] = {
                    note: "",
                    name: "nameIN",
                    number: i.toString(),
                    type: "UNIXSOCKET",
                    direction: "IN",
                    params: "",
                    compareParam: ""
                };
                setInPorts[i] = i.toString();
            }
            index = 0;

            //set out port named continuous naming
            for (var i = numberInIfc; i < numberOutIfc + numberInIfc; i++) {
                intArray[i] = {
                    note: "",
                    number: i.toString(),
                    type: "UNIXSOCKET",
                    direction: "OUT",
                    params: "",
                    compareParam: ""
                };
                setOutPorts[index] = i.toString();
                index++;
            }

            GUIModuleArray[j].prop('description', description);
            GUIModuleArray[j].prop('params', '');
            GUIModuleArray[j].prop('numberOutIfc', numberOutIfc);
            GUIModuleArray[j].prop('numberInIfc', numberInIfc);
            GUIModuleArray[j].prop('parameters', parameters);
            GUIModuleArray[j].prop('name', name);
            GUIModuleArray[j].prop('enabled', 'true');
            GUIModuleArray[j].prop('path', '');
            GUIModuleArray[j].set('inPorts', setInPorts);
            GUIModuleArray[j].set('outPorts', setOutPorts);
            GUIModuleArray[j].prop('paper', 'off');
            var nameLabel = name.substring(0, 12);
            GUIModuleArray[j].attr({
                '.label': {text: nameLabel}
            });
            //safe interface to modul
            GUIModuleArray[j].prop('interface', intArray);
            graphMenu.addCell(GUIModuleArray[j]);
            // GUIModuleArray[j].translate(y);
            //y =y+200;

        }

        //$('#JSON').append(parameter.length + "<br>");
    }


    function loadModules(xmlDoc) {
        //file will be load from server
        /* var g = hlp.getElementsByTagName('from')[0];
         if (typeof g !== "undefined" && typeof g.childNodes[0] !== "undefined") {
         g = g.childNodes[0].nodeValue;
         }
         $('#JSON').append(g);*/

        //var xmlDoc = loadXMLDoc("./dns_valid.xml");

        var available = xmlDoc.getElementsByTagName('available-modules')[0];

        //number of <modules> in xml
        var numberOfElementsModule = 1
        if (typeof available === "undefined") {
            numberOfElementsModule = 0
        }
        //$('#JSON').append(available);
        var parent = xmlDoc.getElementsByTagName('modules')[numberOfElementsModule];
        if (typeof parent === "undefined") {
            alert("XML Element modules is missing");
        }
        var module = parent.getElementsByTagName('module');

        var GUIModuleArray = [];
        var ModuleArray = [];

        for (var j = 0; j < module.length; j++) {

            GUIModuleArray[j] = testModule.clone();
            var name = module[j].getElementsByTagName('name')[0];
            if (typeof name !== "undefined" && typeof name.childNodes[0] !== "undefined") {
                name = name.childNodes[0].nodeValue;
            } else {
                name = "";
            }

            var enabled = module[j].getElementsByTagName('enabled')[0];
            if (typeof enabled !== "undefined" && typeof enabled.childNodes[0] !== "undefined") {
                enabled = enabled.childNodes[0].nodeValue;
            } else {
                enabled = "";
            }

            var path = module[j].getElementsByTagName('path')[0];
            if (typeof path !== "undefined" && typeof path.childNodes[0] !== "undefined") {
                path = path.childNodes[0].nodeValue;
            } else {
                path = "";
            }


            GUIModuleArray[j].prop('name', name);
            GUIModuleArray[j].prop('enabled', enabled);
            GUIModuleArray[j].prop('path', path);


            var params = module[j].getElementsByTagName('params')[0];
            if (typeof params !== "undefined" && typeof params.childNodes[0] !== "undefined") {
                params = params.childNodes[0].nodeValue;
            } else {
                params = "";
            }

            //set x and y position for modul    
            //GUIModuleArray[j].translate(500, y);
            //set right name for modul
            var nameLabel = name.substring(0, 12);
            GUIModuleArray[j].attr({
                '.label': {text: nameLabel}
            });

            //safe params to modul
            GUIModuleArray[j].prop('params', params);
            var interface = module[j].getElementsByTagName('interface');
            var portIn = 0;
            var portOut = 0;
            var intArray = [];
            for (var i = 0; i < interface.length; i++) {

                var note = interface[i].getElementsByTagName('note')[0];
                if (typeof note !== "undefined" && typeof note.childNodes[0] !== "undefined") {
                    note = note.childNodes[0].nodeValue;
                } else {
                    note = "";
                }

                var direction = interface[i].getElementsByTagName('direction')[0];
                if (typeof direction !== "undefined" && typeof direction.childNodes[0] !== "undefined") {
                    direction = direction.childNodes[0].nodeValue;
                } else {
                    direction = "";
                }

                if (direction == "IN")
                    portIn++;
                else if (direction == "OUT")
                    portOut++;
                else
                    direction = "";

                var intParams = interface[i].getElementsByTagName('params')[0];
                if (typeof intParams !== "undefined" && typeof intParams.childNodes[0] !== "undefined") {
                    intParams = intParams.childNodes[0].nodeValue;
                } else {
                    intParams = "";
                }


                var type = interface[i].getElementsByTagName('type')[0];
                if (typeof type !== "undefined" && typeof type.childNodes[0] !== "undefined") {
                    type = type.childNodes[0].nodeValue;
                } else {
                    type = "";
                }

                var ArrayCompareParams = intParams.split(",");
                var compareParam;

                // localhost,compareParam,params || localhost,compareParam
                if (type !== "SERVICE" && (ArrayCompareParams.length == 3 || ArrayCompareParams.length == 2))
                    compareParam = ArrayCompareParams[1];
                // compareParam
                else if (type !== "SERVICE" && ArrayCompareParams.length == 1)
                    compareParam = ArrayCompareParams[0];
                else
                    compareParam = -1; //magic variable hahaahah

                intArray[i] = {
                    note: note,
                    name: name,
                    number: i.toString(),
                    type: type,
                    direction: direction,
                    params: intParams,
                    compareParam: compareParam
                };

                // $('#JSON').append(compareParam);
                // $('#JSON').append("<br>dalsi<br>");
            }


            //safe interface to modul
            GUIModuleArray[j].prop('interface', intArray);
            GUIModuleArray[j].prop('paper', 'on');

            var setInPorts = [];
            var setOutPorts = [];
            //set in port named from 0
            for (var i = 0; i < portIn; i++) {
                setInPorts[i] = i.toString();
            }
            var index = 0;
            //set out port named continuous naming
            for (var i = portIn; i < portOut + portIn; i++) {
                setOutPorts[index] = i.toString();
                index++;
            }
            if(setInPorts.length > setOutPorts.length){
                            var max = setInPorts.length;
                        }else
                            var max = setOutPorts.length;
                        if(max > 12){  
                            GUIModuleArray[j].resize(100,180);
                        }else if(max > 8){
                            GUIModuleArray[j].resize(100,150);
                        }else if(max > 6){
                            GUIModuleArray[j].resize(100,120);
                        }else if(max > 4){
                            GUIModuleArray[j].resize(100,90);
                        }
            // set ports for final modul
            GUIModuleArray[j].set('inPorts', setInPorts);
            GUIModuleArray[j].set('outPorts', setOutPorts);



            ModuleArray[j] = {
                name: name,
                params: params,
                id: GUIModuleArray[j].id,
                interface: intArray
            };
        }
        graph.addCells(GUIModuleArray);
        //graph.resetCells(GUIModuleArray);
        return ModuleArray;
    }

//find all links connected to one port
    /*function getLinksbyPort(links) {
     var retval = _.findWhere(links, {source: });
     }*/

    function layout() {
        var allLinks = graph.getLinks();
        _.each(allLinks, function(link, i) {
            if (!(link.get('target').id)) {
                link.remove();
            }
        });
        joint.layout.DirectedGraph.layout(graph, {
            nodeSep: 0,
            edgeSep: 0,
            rankSep: 150,
            rankDir: "LR"
        });
        var width = $("#graph").width();
        paper.fitToContent({padding: 100, gridWidth: width});
        paper.setOrigin(100, 20);
    }
    function isNameFree(name) {
        var allModules = graph.getElements();
        var bool = true
        _.each(allModules, function(module) {
            var nameOnPaper = module.prop('name');
            var onPaper = module.prop('paper');
            if (nameOnPaper === name && onPaper === 'on') {
                bool = false;
            }
        });
        if (bool)
            return true;
        else
            return false;
    }
//return module from graph
    function getModuleByID(ModuleID) {
        var allModules = graph.getElements();
        var module = _.findWhere(allModules, {id: ModuleID});
        return module;
    }

//from array of module's interfaces find the right one   
    function getInterfaceByNumber(interface, port) {
        var inter = _.findWhere(interface, {number: port});
        return inter;
    }

//change type of given iterface
    function setInterfaceTypeByNumber(interface, port, newVaule) {
        var inter = _.findWhere(interface, {number: port});
        inter.type = newVaule;
    }
    function setInterfaceParamByNumber(interface, port, newVaule) {
        var inter = _.findWhere(interface, {number: port});
        //modify compareparam moyna ne
        inter.params = newVaule;
    }

    function removeLinks(moduleT, port) {
        var allLinks = graph.getLinks();
        var portID = moduleT.id + port;
        _.each(allLinks, function(link, i) {
            var linkIDS = link.get('source').id + link.get('source').port;
            var linkIDI = link.get('target').id + link.get('target').port;
            if (portID === linkIDS) {
                link.remove();
            }
            if(portID === linkIDI){
				link.remove();
			}
        });
    }
    function isPortFree(moduleT, port) {
        var allLinks = graph.getLinks();
        var targetID = moduleT.id + port;
        var numberOfLinks = 0;

        _.each(allLinks, function(link, i) {
            var linkID = link.get('target').id + link.get('target').port;
            if (targetID === linkID) {
                numberOfLinks++;
            }
        });
        if (numberOfLinks > 1)
            return false;
        else
            return true;
    }
    function searchOUT(modules) {
        var sourcePort = [];
        var index = 0;
        for (var i = 0; i < modules.length; i++) {
            for (var j = 0; j < modules[i].interface.length; j++) {
                if (modules[i].interface[j].direction === "OUT") {
                    sourcePort[index] = {
                        source: {
                            id: modules[i].id,
                            selector: modules[i].id + modules[i].interface[j].number + "",
                            port: modules[i].interface[j].number
                        },
                        id: modules[i].interface[j].compareParam,
                        type: modules[i].interface[j].type
                    };
                    index++;
                }
            }
        }
        return sourcePort;
    }

    function loadLinks(modules) {
        var testLink = new joint.dia.Link({});

        var link;

        var sourcePort = searchOUT(modules);

        for (var i = 0; i < modules.length; i++) {
            for (var j = 0; j < modules[i].interface.length; j++) {
                //cannot connect two input ports
                if (modules[i].interface[j].direction !== "IN")
                    continue;

                for (var k = 0; k < sourcePort.length; k++) {
                    //cannot connect different types
                    if (modules[i].interface[j].type !== sourcePort[k].type)
                        continue;
                    if (modules[i].interface[j].compareParam === sourcePort[k].id) {
                        link = testLink.clone();
                        link.set('source', sourcePort[k].source);
                        target = {
                            id: modules[i].id,
                            port: modules[i].interface[j].number
                        };
                        link.set('target', target);
                        link.label(0, {
                            position: .5,
                            attrs: {
                                rect: {fill: 'black'},
                                text: {fill: 'white', text: sourcePort[k].id}
                            }
                        });
                        graph.addCell(link);
                    }
                }
            }
        }
        state = "modify";
    }

//function main is called when we receive xml from php
  /*  $('#nemeaGUI-add').click(*/
    function loadGUI() {
		//var xml2  = "<?xml version='1.0' encoding='UTF-8'?><nemea-supervisor><available-modules><search-paths></search-paths><modules><module><name>123</name><description>Example module for counting number of incoming flow records.</description><number-out-ifc>1</number-out-ifc><number-in-ifc>9</number-in-ifc><short-opt>-n</short-opt><long-opt>--n</long-opt><description>idk</description><mandatory-argument>ahoj</mandatory-argument><argument-type>happy</argument-type></module><module><name>231</name><description>Example module for counting number of incoming flow records.</description><number-out-ifc>1</number-out-ifc><number-in-ifc>4</number-in-ifc><short-opt>-n</short-opt><long-opt>--n</long-opt><description>idk</description><mandatory-argument>ahoj</mandatory-argument><argument-type>happy</argument-type></module><module><name>312</name><description>Example module for counting number of incoming flow records.</description><number-out-ifc>1</number-out-ifc><number-in-ifc>2</number-in-ifc><short-opt>-n</short-opt><long-opt>--n</long-opt><description>idk</description><mandatory-argument>ahoj</mandatory-argument><argument-type>happy</argument-type></module><module><name>end</name><description>konec</description><number-out-ifc>0</number-out-ifc><number-in-ifc>1</number-in-ifc><parameter></parameter></module></modules></available-modules><modules><module><name>DTEST_test21</name><enabled>false</enabled><params>localhost,asdf_s21</params><trapinterfaces><interface><note></note><type>UNIXSOCKET</type><direction>IN</direction><params>asdf_mer_o</params></interface><interface><note></note><type>UNIXSOCKET</type><direction>OUT</direction><params>asdf_s21_o</params></interface><interface><note></note><type>SERVICE</type><direction></direction><params>service_test21</params></interface></trapinterfaces></module><module><name>rewend</name><enabled>True</enabled><params>erwer</params><trapinterfaces><interface><note></note><type>UNIXSOCKET</type><direction>IN</direction><params>asdf_s21_o</params></interface></trapinterfaces></module><module><name>end3</name><enabled>True</enabled><params>fwed</params><trapinterfaces><interface><note></note><type>UNIXSOCKET</type><direction>IN</direction><params>asdf_mer_o</params></interface></trapinterfaces></module><module><name>end</name><enabled>True</enabled><params>fdsf</params><trapinterfaces><interface><note></note><type>UNIXSOCKET</type><direction>IN</direction><params>asdf_mer_o</params></interface></trapinterfaces></module><module><name>DTEST_test_mer</name><enabled>false</enabled><params>localhost,asdf_mer</params><trapinterfaces><interface><note></note><type>UNIXSOCKET</type><direction>IN</direction><params>localhost,asdf_mer</params></interface><interface><note></note><type>UNIXSOCKET</type><direction>OUT</direction><params>asdf_mer_o</params></interface><interface><note></note><type>SERVICE</type><direction></direction><params>service_test_mer</params></interface></trapinterfaces></module><module><name>DTEST_logger</name><enabled>true</enabled><params>-t -T -w /data/xkrobo01/dns_amp_test/detected.log &lt;AMPLIFICATION_ALERT&gt;</params><trapinterfaces><interface><note></note><type>UNIXSOCKET</type><direction>IN</direction><params>asdf_s21_o</params></interface><interface><note></note><type>SERVICE</type><direction></direction><params>service_dns_logger</params></interface></trapinterfaces></module></modules></nemea-supervisor>";
        //var xmlDoc = $.parseXML(xml2);
        var	xmlDoc;
        var formAction = window.location.href;
        var myData = {nemeaForm: {'myXml': 'testovaci data'}};

		//Tady je Ajax request
        $.ajax({
			url: formAction,
			data: myData,
            method: 'POST',
			success: function(data) {
				if(state === "modify")
					state ="start";
                var JSONdata = JSON.parse(data);
                JSONdata = JSONdata + "";
                console.log(typeof xmlDoc);
                xmlDoc = $.parseXML(JSONdata);
                var modules = loadModules(xmlDoc);       
				var availableModules = loadAvailableModules(xmlDoc);
				loadLinks(modules);
				layout();
				var width = $("#graph").width();
				paper.fitToContent({padding: 100, gridWidth: width});
				paper.setOrigin(100, 20);

				joint.layout.DirectedGraph.layout(graphMenu, {
					nodeSep: 0,
					edgeSep: 0,
					rankSep: 150,
					rankDir: "TB"
				});
				var widthMenu = $("#menu").width();
				paperMenu.fitToContent({padding: 0, gridWidth: widthMenu, gridHeight: 110});
				paperMenu.setOrigin(30, 30);
				console.log(JSONdata);	
				state ="modify";
			},
			error: function() {
				$("#test").empty();
				$("#test").append("error");
			}
		});
        // 
    }

    function escapeHtml(str) {
        if (!isNaN(str))
            return str;
        if (typeof str === "string") {
            return str
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#039;");
        } else
            return;
    }
