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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9957142857142857, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "get rms"], "isController": false}, {"data": [0.99, 500, 1500, "get newStyles"], "isController": false}, {"data": [0.99, 500, 1500, "get prodAssemblyRMs"], "isController": false}, {"data": [1.0, 500, 1500, "get plants"], "isController": false}, {"data": [1.0, 500, 1500, "get newReqs"], "isController": false}, {"data": [1.0, 500, 1500, "get styleFormations"], "isController": false}, {"data": [0.99, 500, 1500, "get styleSPOps"], "isController": false}, {"data": [0.99, 500, 1500, "get human info"], "isController": false}, {"data": [1.0, 500, 1500, "get styleApplications"], "isController": false}, {"data": [1.0, 500, 1500, "get machines"], "isController": false}, {"data": [0.99, 500, 1500, "get companies"], "isController": false}, {"data": [1.0, 500, 1500, "get prodAssemblies"], "isController": false}, {"data": [1.0, 500, 1500, "get styleSspRMs"], "isController": false}, {"data": [0.99, 500, 1500, "get sspAddToSps"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 700, 0, 0.0, 140.30714285714282, 58, 1137, 120.0, 198.89999999999998, 244.44999999999925, 488.8700000000001, 7.1167141114274095, 141.21633857767384, 1.1000724379829199], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["get rms", 50, 0, 0.0, 82.5, 68, 253, 74.0, 101.9, 123.14999999999989, 253.0, 0.5194481382978723, 9.016787752192071, 0.07355466802069481], "isController": false}, {"data": ["get newStyles", 50, 0, 0.0, 190.76000000000002, 144, 1137, 163.5, 198.9, 310.44999999999965, 1137.0, 0.510178052140197, 5.971175737207286, 0.07921709989286262], "isController": false}, {"data": ["get prodAssemblyRMs", 50, 0, 0.0, 190.32000000000002, 150, 971, 167.0, 211.8, 275.74999999999983, 971.0, 0.5098295130108491, 0.9160999061913696, 0.08414178486214209], "isController": false}, {"data": ["get plants", 50, 0, 0.0, 112.96000000000001, 76, 423, 98.0, 155.39999999999998, 211.69999999999987, 423.0, 0.5150285325807049, 11.678171384757217, 0.07695250535629675], "isController": false}, {"data": ["get newReqs", 50, 0, 0.0, 134.02, 68, 489, 107.5, 224.6, 314.5999999999996, 489.0, 0.515320477805147, 9.485620787255094, 0.08102206731116081], "isController": false}, {"data": ["get styleFormations", 50, 0, 0.0, 91.82000000000001, 58, 398, 84.5, 114.9, 163.19999999999968, 398.0, 0.517384105960265, 0.6280355895591887, 0.0762939453125], "isController": false}, {"data": ["get styleSPOps", 50, 0, 0.0, 203.56, 157, 1104, 177.0, 216.7, 294.1999999999998, 1104.0, 0.5099491070791135, 11.75721530178788, 0.08665150842945873], "isController": false}, {"data": ["get human info", 50, 0, 0.0, 139.32000000000002, 66, 520, 124.0, 214.59999999999994, 303.4499999999996, 520.0, 0.5168866881002347, 3.796896160048794, 0.07723013992122646], "isController": false}, {"data": ["get styleApplications", 50, 0, 0.0, 129.36000000000004, 72, 476, 118.0, 152.79999999999995, 256.84999999999997, 476.0, 0.5170630816959669, 0.7579215679937952, 0.08432571742502586], "isController": false}, {"data": ["get machines", 50, 0, 0.0, 86.19999999999997, 63, 191, 80.5, 115.39999999999999, 162.69999999999987, 191.0, 0.5191299382235374, 4.94795722369309, 0.07249568473238852], "isController": false}, {"data": ["get companies", 50, 0, 0.0, 199.05999999999995, 145, 979, 184.0, 214.8, 241.54999999999993, 979.0, 0.5103342689461597, 9.47756522709875, 0.07176575657055372], "isController": false}, {"data": ["get prodAssemblies", 50, 0, 0.0, 97.67999999999999, 64, 363, 81.0, 193.39999999999986, 235.54999999999984, 363.0, 0.5157403969138095, 0.8688009615979702, 0.08411000613731073], "isController": false}, {"data": ["get styleSspRMs", 50, 0, 0.0, 189.85999999999999, 149, 405, 172.0, 288.9, 313.3499999999999, 405.0, 0.5139802631578947, 49.851066187808385, 0.08281908537212171], "isController": false}, {"data": ["get sspAddToSps", 50, 0, 0.0, 116.88000000000001, 86, 547, 101.5, 126.5, 211.09999999999985, 547.0, 0.5155595883772246, 23.716244541512857, 0.08307356648656451], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 700, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
