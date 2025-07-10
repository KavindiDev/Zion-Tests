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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9932142857142857, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "get rms"], "isController": false}, {"data": [0.985, 500, 1500, "get newStyles"], "isController": false}, {"data": [0.99, 500, 1500, "get prodAssemblyRMs"], "isController": false}, {"data": [0.995, 500, 1500, "get plants"], "isController": false}, {"data": [0.995, 500, 1500, "get newReqs"], "isController": false}, {"data": [1.0, 500, 1500, "get styleFormations"], "isController": false}, {"data": [0.98, 500, 1500, "get styleSPOps"], "isController": false}, {"data": [1.0, 500, 1500, "get human info"], "isController": false}, {"data": [1.0, 500, 1500, "get styleApplications"], "isController": false}, {"data": [1.0, 500, 1500, "get machines"], "isController": false}, {"data": [0.98, 500, 1500, "get companies"], "isController": false}, {"data": [1.0, 500, 1500, "get prodAssemblies"], "isController": false}, {"data": [0.985, 500, 1500, "get styleSspRMs"], "isController": false}, {"data": [0.995, 500, 1500, "get sspAddToSps"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1400, 0, 0.0, 216.8685714285714, 120, 889, 211.0, 306.0, 342.9000000000001, 536.96, 14.037480071791684, 278.51707809852303, 2.169856015561549], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["get rms", 100, 0, 0.0, 182.97000000000003, 132, 499, 188.0, 207.70000000000002, 254.0, 497.8099999999994, 1.0197214121102116, 17.69873892327616, 0.14439414526951236], "isController": false}, {"data": ["get newStyles", 100, 0, 0.0, 248.85000000000008, 212, 871, 222.0, 279.5, 436.2999999999996, 867.9599999999984, 1.009234495635061, 11.810211876166928, 0.15670730938083466], "isController": false}, {"data": ["get prodAssemblyRMs", 100, 0, 0.0, 245.78000000000006, 210, 829, 222.0, 281.4000000000001, 401.0, 827.6499999999993, 1.0086644274316379, 1.8104738453313967, 0.16646903148041678], "isController": false}, {"data": ["get plants", 100, 0, 0.0, 213.12000000000003, 144, 529, 202.0, 234.70000000000007, 337.6499999999997, 528.3699999999997, 1.0160433240873392, 23.03659946810132, 0.15181116072789344], "isController": false}, {"data": ["get newReqs", 100, 0, 0.0, 229.89000000000001, 143, 539, 219.0, 277.9000000000001, 341.54999999999967, 538.3899999999996, 1.015310888193965, 18.687074521280916, 0.15963384081955895], "isController": false}, {"data": ["get styleFormations", 100, 0, 0.0, 137.73000000000002, 120, 361, 126.0, 151.60000000000002, 209.04999999999956, 360.93999999999994, 1.0196278358399185, 1.2357013127708385, 0.15035527657405046], "isController": false}, {"data": ["get styleSPOps", 100, 0, 0.0, 314.91, 278, 889, 288.0, 345.8, 488.39999999999986, 886.9399999999989, 1.008206803379509, 23.2429082103321, 0.17131639041800253], "isController": false}, {"data": ["get human info", 100, 0, 0.0, 141.48000000000005, 123, 486, 129.5, 161.40000000000003, 209.4999999999999, 484.11999999999904, 1.0190875090444016, 7.483923894544825, 0.15226600476932955], "isController": false}, {"data": ["get styleApplications", 100, 0, 0.0, 155.75000000000003, 122, 414, 145.0, 188.20000000000005, 218.34999999999985, 413.65999999999985, 1.0199398235504105, 1.4930564409199858, 0.16633784231730328], "isController": false}, {"data": ["get machines", 100, 0, 0.0, 143.45000000000005, 125, 349, 134.0, 160.70000000000002, 191.1499999999998, 348.98, 1.0200022440049368, 9.719904196289232, 0.14244171962178317], "isController": false}, {"data": ["get companies", 100, 0, 0.0, 306.8299999999999, 273, 864, 285.5, 311.9, 486.84999999999997, 861.2499999999986, 1.0092039399321815, 18.74024699004925, 0.14191930405296302], "isController": false}, {"data": ["get prodAssemblies", 100, 0, 0.0, 144.2600000000001, 121, 433, 128.0, 162.80000000000007, 220.74999999999994, 432.88999999999993, 1.016714791166782, 1.7107417824027005, 0.16581188488755136], "isController": false}, {"data": ["get styleSspRMs", 100, 0, 0.0, 318.67999999999984, 265, 578, 306.0, 346.8, 407.4499999999999, 577.91, 1.0142605026675051, 98.37138289348236, 0.16343064740247887], "isController": false}, {"data": ["get sspAddToSps", 100, 0, 0.0, 252.4600000000001, 157, 519, 263.0, 316.0, 356.5999999999999, 518.0599999999995, 1.0162704905537656, 46.747450113822296, 0.16375452240368296], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1400, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
