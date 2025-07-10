/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9857142857142858, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "get rms"], "isController": false}, {"data": [0.95, 500, 1500, "get newStyles"], "isController": false}, {"data": [0.95, 500, 1500, "get prodAssemblyRMs"], "isController": false}, {"data": [1.0, 500, 1500, "get plants"], "isController": false}, {"data": [1.0, 500, 1500, "get newReqs"], "isController": false}, {"data": [1.0, 500, 1500, "get styleFormations"], "isController": false}, {"data": [0.95, 500, 1500, "get styleSPOps"], "isController": false}, {"data": [1.0, 500, 1500, "get human info"], "isController": false}, {"data": [1.0, 500, 1500, "get styleApplications"], "isController": false}, {"data": [1.0, 500, 1500, "get machines"], "isController": false}, {"data": [0.95, 500, 1500, "get companies"], "isController": false}, {"data": [1.0, 500, 1500, "get prodAssemblies"], "isController": false}, {"data": [1.0, 500, 1500, "get styleSspRMs"], "isController": false}, {"data": [1.0, 500, 1500, "get sspAddToSps"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 140, 0, 0.0, 163.942857142857, 57, 786, 134.0, 237.8, 310.0499999999998, 772.0600000000002, 7.592602635717772, 150.65935313737188, 1.1736333315255707], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["get rms", 10, 0, 0.0, 80.50000000000001, 70, 135, 73.0, 130.70000000000002, 135.0, 135.0, 0.5804841237592151, 10.076274706855518, 0.08219745893074824], "isController": false}, {"data": ["get newStyles", 10, 0, 0.0, 281.70000000000005, 179, 752, 227.0, 709.3000000000002, 752.0, 752.0, 0.5520896593606802, 6.46171344476343, 0.08572485921713686], "isController": false}, {"data": ["get prodAssemblyRMs", 10, 0, 0.0, 261.8, 168, 786, 212.5, 730.6000000000001, 786.0, 786.0, 0.5522726017562269, 0.9923648312807202, 0.09114655243828354], "isController": false}, {"data": ["get plants", 10, 0, 0.0, 129.1, 78, 230, 118.5, 223.50000000000003, 230.0, 230.0, 0.5744155321959906, 13.024760002010455, 0.08582575822850251], "isController": false}, {"data": ["get newReqs", 10, 0, 0.0, 136.4, 96, 227, 130.0, 219.50000000000003, 227.0, 227.0, 0.5712653527563554, 10.515410775492716, 0.08981808768923165], "isController": false}, {"data": ["get styleFormations", 10, 0, 0.0, 89.7, 57, 155, 80.0, 152.0, 155.0, 155.0, 0.5751754285056943, 0.6981865797193144, 0.0848159079144139], "isController": false}, {"data": ["get styleSPOps", 10, 0, 0.0, 266.40000000000003, 200, 683, 227.5, 639.3000000000002, 683.0, 683.0, 0.5526388505111909, 12.741455685272175, 0.09390542967670627], "isController": false}, {"data": ["get human info", 10, 0, 0.0, 115.1, 64, 140, 115.5, 140.0, 140.0, 140.0, 0.5774005427565101, 4.241412971303193, 0.08627176078295513], "isController": false}, {"data": ["get styleApplications", 10, 0, 0.0, 105.1, 63, 146, 112.5, 145.1, 146.0, 146.0, 0.5791729410401947, 0.8489634614270822, 0.09445496206417237], "isController": false}, {"data": ["get machines", 10, 0, 0.0, 96.6, 67, 236, 73.0, 224.30000000000004, 236.0, 236.0, 0.578938227291148, 5.518004978868754, 0.08084781885022868], "isController": false}, {"data": ["get companies", 10, 0, 0.0, 278.1, 158, 749, 218.5, 707.3000000000002, 749.0, 749.0, 0.5533421868083223, 10.276277701693228, 0.07781374501992032], "isController": false}, {"data": ["get prodAssemblies", 10, 0, 0.0, 128.6, 71, 292, 121.0, 279.00000000000006, 292.0, 292.0, 0.5721151095600434, 0.9637681288975343, 0.0933039290005149], "isController": false}, {"data": ["get styleSspRMs", 10, 0, 0.0, 199.89999999999998, 153, 311, 191.5, 301.30000000000007, 311.0, 311.0, 0.5705808513066302, 55.34077049811708, 0.09193929732968162], "isController": false}, {"data": ["get sspAddToSps", 10, 0, 0.0, 126.20000000000002, 97, 238, 115.0, 227.50000000000006, 238.0, 238.0, 0.5776340110905731, 26.571728605880313, 0.09307579280268022], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 140, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
