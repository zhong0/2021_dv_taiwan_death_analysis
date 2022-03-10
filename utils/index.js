console.log('svg');

// metadata
const width = window.innerWidth, height = window.innerHeight;

// elements
const svg = d3.select('svg');
const zoom = d3
  .zoom()
  .scaleExtent([0.6, 10])
  .on('zoom', () => {
    svg
      .selectAll('path')
      .attr('transform', d3.event.transform);
  });

var projection = d3.geoMercator()
    .center([120.97388, 23.6])                // GPS of location to zoom on
    .scale(width * 5)                       // This is like the zoom
    .translate([width / 2, height / 2 - 80])
    .precision(0.1)

var size = d3.scaleLinear()
      .domain([1,100])  // What's in the data
      .range([ 4, 50])

var color = d3.scaleOrdinal()
      .domain(["A", "B", "C", "D" ])
      .range(["#33A6B8", "#D18975", "#8FD175", 'yellow'])


const path = d3
  .geoPath()
  .projection(
    d3
      .geoMercator()
      .center([120.97388, 23.6])
      .scale(width * 5)
      .translate([width / 2, height / 2 - 80])
      .precision(0.1)
  );
svg.call(zoom);

// data
const regionMap = 'data/town_1090324.json';
const brainBlood_dt = 'data/district_brainBlood.json';
const breath_dt = 'data/district_breath.json';
const diabetes_dt = 'data/district_diabetes.json';
const heartDisease_dt = 'data/district_heartDisease.json';
const highBloodPressure_dt = 'data/district_highBloodPressure.json';
const pneumonia_dt = 'data/district_pneumonia.json';
const tumor_dt = 'data/district_tumor.json';

const countyMap = 'data/county_1090820.json';
const brainBlood_cy = 'data/county_brainBlood.json';
const breath_cy = 'data/county_breath.json';
const diabetes_cy = 'data/county_diabetes.json';
const heartDisease_cy = 'data/county_heartDisease.json';
const highBloodPressure_cy = 'data/county_highBloodPressure.json';
const pneumonia_cy = 'data/county_pneumonia.json';
const tumor_cy = 'data/county_tumor.json';

const waterJson = 'data/RPI.json';
const airJson = 'data/aqi.json';
const indigenousJson = 'data/indigenous.json';
const smokeJson = 'data/smoke.json';
const average_cy = 'data/county_average.json';
const average_dt = 'data/district_average.json';

var nowCounty = true;
var nowDiseaseIndex = 0; //是哪一個疾病 (0-6)
var yearChoice = 103;
var nowDiseaseData = 0;  //讀取全部資料陣列(value[nowDiseaseData])中的哪一個 (0-15)
var nowAnime = false;
var nowTypeRate = true;
var chartX = [];
var chartY = [];
var diseaseChineseName = ['腦血管疾病', '慢性下呼吸道疾病', '肺炎', '心臟疾病', '高血壓疾病', '糖尿病', '惡性腫瘤'];
var lineChartData = [];
var nowEnvIndex = 0;

var widthLC = 400;
var heightLC = 240;
var marginLC = 60;
var modifyY = 30;

var waterSwitch = false;
var airSwitch = false;
var oriRaceSwitch = false;
var smokeSwitch = false;

const svgLineChart = d3
    .select("#my_dataviz")
    .append("svg")
    .attr("width", widthLC)
    .attr("height", heightLC);

var fakeData = [{"year":103, "num":5},{"year":104, "num":5}];


var widthBC = 400;
var heightBC = 240;
var marginBC = 60;
var sortedData;
var sortedDict = [];

const svgBarChart = d3
    .select("#environmentChart")
    .append("svg")
    .attr("width", widthBC)
    .attr("height", heightBC);

Promise.all([regionMap, brainBlood_dt, breath_dt, diabetes_dt, heartDisease_dt, highBloodPressure_dt, pneumonia_dt, tumor_dt,
             countyMap, brainBlood_cy, breath_cy, diabetes_cy, heartDisease_cy, highBloodPressure_cy, pneumonia_cy, tumor_cy,
             waterJson, airJson, indigenousJson, smokeJson, average_cy, average_dt
            ].map(f => d3.json(f))).then(values => {

    function drawLineChart(lineData, avgDT){
        var lastIndex;
        if(nowCounty){
            lastIndex = 9;
        }else{
            lastIndex = 5;
        }
        svgLineChart.selectAll('path').remove();
        svgLineChart.selectAll('circle').remove();
        svgLineChart.selectAll('text').remove();
        svgLineChart.selectAll('g').remove();
        var minOne = d3.min(lineData, (d) => d.num); // 算出最小值
        var maxOne = d3.max(lineData, (d) => d.num); // 算出最大值
        var minAvg = d3.min(avgDT, (d) => d.num);
        var maxAvg = d3.max(avgDT, (d) => d.num);
        var min;
        var max;
        if(minOne < minAvg){
            min = minOne;
        }else{
            min = minAvg;
        }
        if(maxOne > maxAvg){
            max = maxOne;
        }else{
            max = maxAvg;
        }
        var xScale = d3.scaleBand()
                    .domain(lineData.map(d => d.year))
                    .range([marginLC, widthLC - marginLC])
                    .paddingInner(0.2)
                    .paddingOuter(0.3)
                    .round(true);
        var xAxis = d3.axisBottom(xScale);

        svgLineChart.append("g")
                .attr("transform", `translate(0, ${heightLC - marginLC -  modifyY})`)
                .attr("class", "xaxis")
                .attr("color", "#6f6866")
                .call(xAxis);

        svgLineChart.append("text")
                .attr("transform", `translate(${widthLC - marginLC}, ${heightLC - 30 -  modifyY})`)
                .style("text-anchor", "middle")
                .attr("fill", "#6f6866")
                .attr("font-size", "12px")
                .text("民國年份");

        var yScale = d3
                .scaleLinear() // 做一個線性比例尺  v3 寫法 scale.linear()
                .domain([0, max]) // 設data值的區間
                .range([heightLC - marginLC, marginLC]) //設定自定義區域的範圍
                .nice();
        var yAxis = d3.axisLeft(yScale);

        svgLineChart.append("g")
                .attr("transform", `translate( ${marginLC}, ${-modifyY})`)
                .attr("class", "yaxis")
                .attr("color", "#6f6866")
                .call(yAxis);

      var line = d3.line()
                  .x(function(d) {return xScale(d.year)})
                  .y(function(d) {return yScale(d.num)});

        svgLineChart.append("path")
                .attr("d", line(avgDT))
                .attr("transform", `translate(10, ${-modifyY})`)
                .attr("stroke", "#6f6866")
                .style("stroke-width", 2)
                .style("fill", "none");
      svgLineChart.append("path")
                .attr("d", line(lineData))
                .attr("transform", `translate(10, ${-modifyY})`)
                .attr("stroke", "#38302e")
                .style("stroke-width", 2)
                .style("fill", "none");


      if(nowTypeRate){
              svgLineChart.append("text")
                    .attr("transform", `translate(${marginLC - 20},  ${40 - modifyY})`)
                    .style("text-anchor", "middle")
                    .attr("fill", "#6f6866")
                    .attr("font-size", "12px")
                    .text("死亡率(%)");
              svgLineChart.selectAll("myPoints")
                    .data(avgDT)
                    .enter()
                    .append("circle")
                    .attr("fill", "#6f6866")
                    .attr("transform", `translate(10, ${-modifyY})`)
                    .attr("cx", d => xScale(d.year))
                    .attr("cy", d => yScale(d.num))
                    .attr("r", 5)
                    .attr("stroke", "#d5c7bc")
                    .on('mouseover', function(d) {
                          div.transition()
                              .duration(200)
                              .style("opacity", .9);
                          div.html(`${d.year}年 全台平均<br>
                                死亡率 ${d.num.toFixed(2)} %`)
                            .style("left", (d3.event.pageX) + "px")
                            .style("top", (d3.event.pageY + 20) + "px");
                            })
                    .on("mouseout", function(d) {
                          div.transition()
                            .duration(500)
                            .style("opacity", 0);
                    });

              svgLineChart.selectAll("myPoints")
                    .data(lineData)
                    .enter()
                    .append("circle")
                    .attr("fill", "#38302e")
                    .attr("transform", `translate(10, ${-modifyY})`)
                    .attr("cx", d => xScale(d.year))
                    .attr("cy", d => yScale(d.num))
                    .attr("r", 5)
                    .attr("stroke", "#d5c7bc")
                    .on('mouseover', function(d) {
                          div.transition()
                            .duration(200)
                            .style("opacity", .9);
                          div.html(`${d.year}年 該地區<br>
                              死亡率 ${d.num.toFixed(2)} %`)
                                    .style("left", (d3.event.pageX) + "px")
                                    .style("top", (d3.event.pageY + 20) + "px");
                        })
                    .on("mouseout", function(d) {
                          div.transition()
                             .duration(500)
                            .style("opacity", 0);
                      });
              }else{
                svgLineChart.append("text")
                    .attr("transform", `translate(${marginLC - 20}, ${40 - modifyY})`)
                    .style("text-anchor", "middle")
                    .attr("fill", "#6f6866")
                    .attr("font-size", "12px")
                    .text("人數(人)");
                svgLineChart.selectAll("myPoints")
                        .data(avgDT)
                        .enter()
                        .append("circle")
                        .attr("fill", "#6f6866")
                        .attr("transform", `translate(10, ${-modifyY})`)
                        .attr("cx", d => xScale(d.year))
                        .attr("cy", d => yScale(d.num))
                        .attr("r", 5)
                        .attr("stroke", "#d5c7bc")
                        .on('mouseover', function(d) {
                              div.transition()
                                  .duration(200)
                                  .style("opacity", .9);
                              div.html(`${d.year}年 全台平均<br>
                                    死亡人數 ${d.num.toFixed(0)}人`)
                                .style("left", (d3.event.pageX) + "px")
                                .style("top", (d3.event.pageY + 20) + "px");
                                })
                        .on("mouseout", function(d) {
                              div.transition()
                                .duration(500)
                                .style("opacity", 0);
                        });

                svgLineChart.selectAll("myPoints")
                        .data(lineData)
                        .enter()
                        .append("circle")
                        .attr("fill", "#38302e")
                        .attr("transform", `translate(10, ${-modifyY})`)
                        .attr("cx", d => xScale(d.year))
                        .attr("cy", d => yScale(d.num))
                        .attr("r", 5)
                        .attr("stroke", "#d5c7bc")
                        .on('mouseover', function(d) {
                              div.transition()
                                .duration(200)
                                .style("opacity", .9);
                              div.html(`${d.year}年 該地區<br>
                                  死亡人數 ${d.num.toFixed(0)}人`)
                                      .style("left", (d3.event.pageX) + "px")
                                      .style("top", (d3.event.pageY + 20) + "px");
                          })
                        .on("mouseout", function(d) {
                              div.transition()
                                 .duration(500)
                                 .style("opacity", 0);
                        });
        }

          svgLineChart
                  .selectAll("myLabels")
                  .data(avgDT)
                  .enter()
                  .append('g')
                  .append("text")
                  .attr("x", xScale(avgDT[lastIndex]["year"])+20)
                  .attr("y", yScale(avgDT[lastIndex]["num"])-25)
                  .text("全台平均")
                  .style("fill", "#6f6866")
                  .style("font-size", 12)
                  .style('font-weight', 'bold');

            svgLineChart
                  .selectAll("myLabels")
                  .data(lineData)
                  .enter()
                  .append('g')
                  .append("text")
                  .attr("x", xScale(lineData[lastIndex]["year"])+20)
                  .attr("y", yScale(lineData[lastIndex]["num"])-25)
                  .text("該地區")
                  .style("fill", "#38302e")
                  .style("font-size", 12)
                  .style('font-weight', 'bold');
  }

  function drawBarChart(data, envIndex){
    svgBarChart.selectAll('rect').remove();
    svgBarChart.selectAll('text').remove();
    svgBarChart.selectAll('g').remove();
    var envColorList = ["#3A8FB7", "#24936E", "#D7B98E", "#ED784A"];
    var colorChose = envColorList[envIndex];
    var modNum = [20, 2.5, 0.01, 10];
    svgBarChart.selectAll('rect')
       .data(data)
       .enter()
       .append('rect')
       .attr("fill", colorChose)
       .attr("width", 0)
       .attr("height", 30)
       .attr("x", 0)
       .attr("y", function(d){return (d.x-1) * 38;})
       .transition()
         .duration(1000)
         .attr("width", function(d){return d.num*modNum[envIndex];});
      if (envIndex == 0){
           svgBarChart.selectAll('text')
                      .data(data)
                      .enter()
                      .append('text')
                      .text(function(d) { return 0;})
                      .attr("fill", "#6f6866")
                      .attr("x", 3)
                      .attr("y", function(d){return d.x * 38 - 16;})
                      .transition()
                         .duration(1000)
                         .attr("x", function(d){return d.num*modNum[envIndex] + 3;})
                         .tween("number", function(d){
                           var i = d3.interpolateRound(0, d.num);
                             return function(t) { this.textContent =  i(t) + " " + d.item;};
           });
        }else if(envIndex == 1){
           svgBarChart.selectAll('text')
                      .data(data)
                      .enter()
                      .append('text')
                      .text(function(d) { return 0;})
                      .attr("fill", "#6f6866")
                      .attr("x", 3)
                      .attr("y", function(d){return d.x * 38 -16;})
                      .transition()
                         .duration(1000)
                         .attr("x", function(d){return d.num*modNum[envIndex] + 3;})
                         .tween("number", function(d){
                           var i = d3.interpolateRound(0, d.num);
                             return function(t) { this.textContent =  i(t) +" "+ d.item;};
           });
        }else if(envIndex == 2){
          svgBarChart.selectAll('text')
                     .data(data)
                     .enter()
                     .append('text')
                     .text(function(d) { return 0;})
                     .attr("fill", "#6f6866")
                     .attr("x", 3)
                     .attr("y", function(d){return d.x * 38 - 16;})
                     .transition()
                        .duration(1000)
                        .attr("x", function(d){return d.num*modNum[envIndex] + 3;})
                        .tween("number", function(d){
                          var i = d3.interpolateRound(0, d.num);
                            return function(t) { this.textContent = i(t) + "人 " + d.item;};
          });
      }else if(envIndex == 3){
          svgBarChart.selectAll('text')
                     .data(data)
                     .enter()
                     .append('text')
                     .text(function(d) { return 0;})
                     .attr("fill", "#6f6866")
                     .attr("x", 3)
                     .attr("y", function(d){return d.x * 38 - 16;})
                     .transition()
                        .duration(1000)
                        .attr("x", function(d){return d.num*modNum[envIndex] + 3;})
                        .tween("number", function(d){
                          var i = d3.interpolateRound(0, d.num);
                            return function(t) { this.textContent = i(t) + "% " + d.item;};
          });
        }

        var barScale = d3
              .scaleLinear() // 做一個線性比例尺  v3 寫法 scale.linear()
              .domain([0, 100]) // 設data值的區間
              .range([0, 180]); //設定自定義區域的範圍
        var barAxis = d3.axisLeft(barScale);

        svgBarChart.append("g")
              .attr("transform", `translate(0, 0)`)
              .attr("class", "yaxis")
              .attr("color", "#6f6866")
              .call(barAxis);
  }
  function getAverageData(idx){
      var avgData;
      var avgStr;
      var avgDict = [];
      if(nowCounty){    //現在是county的狀態
          avgData = values[20];  //指定county資料
          if(nowTypeRate){  //現在是rate的狀態
            for(var i = 0; i < 10; i++){
              avgStr = "struct_" + (i+99);
              avgDict[i] = {"year": i+99 ,"num":avgData[idx][avgStr]}
            }
          }else{
            for(var i = 0; i < 10; i++){
              avgStr = "num_" + (i+99);
              avgDict[i] = {"year": i+99 ,"num":avgData[idx][avgStr]}
            }
          }
      }else{
        avgData = values[21];  //指定county資料
        if(nowTypeRate){  //現在是rate的狀態
          for(var i = 0; i < 6; i++){
            avgStr = "struct_" + (i+103);
            avgDict[i] = {"year": i+103 ,"num":avgData[idx][avgStr]}
          }
        }else{
          for(var i = 0; i < 6; i++){
            avgStr = "num_" + (i+103);
            avgDict[i] = {"year": i+103 ,"num":avgData[idx][avgStr]}
          }
        }
      }
    return avgDict;
  }

  function chooseEnviromentData(index, year){
      var envData;
      var sortStr;
      switch (index) {
        case 0: //water
            envData = values[16];
            sortStr = "year_" + year;
            break;
        case 1: //air
              envData = values[17];
              sortStr = "avg_" + year;
              break;
        case 2:
              envData = values[18];
              sortStr = "pop_" + year;
              break;
        case 3:
              envData = values[19];
              sortStr = "year_" + year;
              break;
      }
      sortedData = envData.slice().sort((a, b) => d3.descending(a[sortStr], b[sortStr]));
      for(var i = 0; i < 5; i++){
          switch (index) {
            case 0:
              sortedDict[i] = {"x": i+1, "item": sortedData[i].river, "num":sortedData[i][sortStr]};
              break;
            case 1:
              sortedDict[i] = {"x": i+1, "item": sortedData[i].station_name + "("+ sortedData[i].county + ")", "num":sortedData[i][sortStr]};
              break;
            case 2:
              sortedDict[i] = {"x": i+1, "item": sortedData[i].city + sortedData[i].township, "num":sortedData[i][sortStr]};
              break;
            case 3:
              sortedDict[i] = {"x": i+1, "item": sortedData[i].city, "num":sortedData[i][sortStr]};
              break;
          }
      }
      return sortedDict;

  }

  if (document.querySelector('input[name="env"]')) {
      document.querySelectorAll('input[name="env"]').forEach((elem) => {
              elem.addEventListener("change", function(event) {
                  var item = event.target.value;
                  switch(item){
                    case "0":
                      drawBarChart(chooseEnviromentData(0, yearChoice), 0);
                      nowEnvIndex = 0;
                      break;
                    case "1":
                      drawBarChart(chooseEnviromentData(1, yearChoice), 1);
                      nowEnvIndex = 1;
                      break;
                    case "2":
                      drawBarChart(chooseEnviromentData(2, yearChoice), 2);
                      nowEnvIndex = 2;
                      break;
                    case "3":
                      drawBarChart(chooseEnviromentData(3, yearChoice), 3);
                      nowEnvIndex = 3;
                      break;
                  }
              });
          });
    }

  var waterBox = document.getElementById("water");
      waterBox.addEventListener("click", function() {
        if(waterSwitch){
            waterSwitch = false;
        }else{
            waterSwitch = true;
        }
        if(nowCounty){
            updateCountyMap(nowDiseaseIndex, yearChoice);
        }else{
            updateDistrictMap(nowDiseaseIndex, yearChoice);
        }
  });

  var airBox = document.getElementById("air");
      airBox.addEventListener("click", function() {
        if(airSwitch){
            airSwitch = false;
        }else{
            airSwitch = true;
        }
        if(nowCounty){
            updateCountyMap(nowDiseaseIndex, yearChoice);
        }else{
            updateDistrictMap(nowDiseaseIndex, yearChoice);
        }
  });

  var smokeBox = document.getElementById("smoke");
      smokeBox.addEventListener("click", function() {
        if(smokeSwitch){
            smokeSwitch = false;
        }else{
            smokeSwitch = true;
        }
        if(nowCounty){
            updateCountyMap(nowDiseaseIndex, yearChoice);
        }else{
            updateDistrictMap(nowDiseaseIndex, yearChoice);
        }
  });

  var oriRace = document.getElementById("oriRace");
      oriRace.addEventListener("click", function() {
        if(oriRaceSwitch){
            oriRaceSwitch = false;
        }else{
            oriRaceSwitch = true;
        }
        if(nowCounty){
            updateCountyMap(nowDiseaseIndex, yearChoice);
        }else{
            updateDistrictMap(nowDiseaseIndex, yearChoice);
        }
  });

  document
    .querySelectorAll('.tab-controls__link_Map')
    .forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tabs = document.querySelectorAll('.tab-controls__link_Map');
        tabs.forEach(tab => tab.classList.remove('active'));
        e.target.classList.toggle('active');
        getMap(e.target.dataset.index);
      });
    });

  document
      .querySelectorAll('.tab-controls__link_Anime')
      .forEach(btn => {
        btn.addEventListener('click', (e) => {
          const tabs = document.querySelectorAll('.tab-controls__link_Anime');
          tabs.forEach(tab => tab.classList.remove('active'));
          e.target.classList.toggle('active');
          getAnime(e.target.dataset.index);
        });
      });

    document
        .querySelectorAll('.tab-controls__link_Num')
        .forEach(btn => {
          btn.addEventListener('click', (e) => {
            const tabs = document.querySelectorAll('.tab-controls__link_Num');
            tabs.forEach(tab => tab.classList.remove('active'));
            e.target.classList.toggle('active');
            getNumType(e.target.dataset.index);
          });
        });

  document
    .querySelectorAll('.tab-controls__link')
    .forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tabs = document.querySelectorAll('.tab-controls__link');
        tabs.forEach(tab => tab.classList.remove('active'));
        e.target.classList.toggle('active');
        if(nowCounty){
          nowDiseaseIndex = e.target.dataset.index;
          updateCountyMap(nowDiseaseIndex, yearChoice);
        }else{
          nowDiseaseIndex = e.target.dataset.index;
          updateDistrictMap(nowDiseaseIndex, yearChoice);
        }
      });
    });
    function changeRulerType(index){
      if(index == 0){
        d3.select("#badgeTitle").text("死亡率Z-Score");
        d3.select("#score0").text("-2");
        d3.select("#score1").text("-1");
        d3.select("#score2").text("0");
        d3.select("#score3").text("1");
        d3.select("#score4").text("2");
      }else if(index == 1){
        d3.select("#badgeTitle").text("死亡人數(人)");
        d3.select("#score0").text("200");
        d3.select("#score1").text("400");
        d3.select("#score2").text("600");
        d3.select("#score3").text("800");
        d3.select("#score4").text("1000");
      }else if(index == 2){
        d3.select("#badgeTitle").text("死亡人數(人)");
        d3.select("#score0").text("0");
        d3.select("#score1").text("18");
        d3.select("#score2").text("36");
        d3.select("#score3").text("54");
        d3.select("#score4").text("72");
      }
    }

    function getNumType(index){
      if (index == 25){
        nowTypeRate = true;
        changeRulerType(0);
        if(nowCounty){
          updateCountyMap(nowDiseaseIndex, yearChoice);
        }else{
          updateDistrictMap(nowDiseaseIndex, yearChoice);
        }
      }else if (index == 26) {
        nowTypeRate = false;
        if(nowCounty){
          updateCountyMap(nowDiseaseIndex, yearChoice);
          changeRulerType(1);
        }else{
          changeRulerType(2);
          updateDistrictMap(nowDiseaseIndex, yearChoice);

        }
      }
    };


    function getAnime(index){
      if (index == 50){
        nowAnime = false;
      }else if (index == 51) {
        nowAnime = true;
      }
    };

    function getMap(index){
        if (index == 98){
          nowCounty = true;
          if(nowTypeRate){
            changeRulerType(0);
          }else{
            changeRulerType(1);
          }
          updateCountyMap(nowDiseaseIndex, yearChoice);
        }else if(index == 99){
          nowCounty = false;
          if(nowTypeRate){
            changeRulerType(0);
          }else{
            changeRulerType(2);
          }
          updateDistrictMap(nowDiseaseIndex, yearChoice);
        }
    };

    function catchDiseaseYearData(nowData){
      lineChartData = [];
      chartX = [];
      chartY = [];
      var tmpStr;
      if(nowCounty){ //是縣市資料
        for(var i = 0; i < 10; i++){
          chartX[i] = i + 99;
        }
        if(nowTypeRate){ //是比率
          for(var i = 0; i < 10; i++){
            tmpStr = "struct_" + chartX[i];
            chartY[i] = nowData[tmpStr];
          }
        }else{ //是人數
          for(var i = 0; i < 10; i++){
            tmpStr = "num_" + chartX[i];
            chartY[i] = nowData[tmpStr];
          }
        }
        for(var i = 0; i < 10; i++){
          lineChartData[i] = { "year": chartX[i], "num": chartY[i]}
          //document.write(lineChartData[i].num);
        }
      }else{ //是鄉鎮資料
        for(var i = 0; i < 6; i++){
          chartX[i] = i + 103;
        }
        if(nowTypeRate){ //是比率(結構比)
          for(var i = 0; i < 6; i++){
            tmpStr = "struct_" + chartX[i];
            chartY[i] = nowData[tmpStr]
          }
        }else{ //是人數
          for(var i = 0; i < 6; i++){
            tmpStr = "num_" + chartX[i];
            chartY[i] = nowData[tmpStr]
          }
        }
        for(var i = 0; i < 6; i++){
            lineChartData[i] = {"year":chartX[i], "num": chartY[i] }
        }
      }
      return lineChartData;
    }

    $(function(){   //時間軸 + 動畫
    	let inputs = $('.input');
    	let paras = $('.description-flex-container').find('p');
    	inputs.click(function(){
    		var t = $(this);
    		var ind = t.index();
    		var	matchedPara = paras.eq(ind);
        var nodeList = [];
        var oldYearChoice = yearChoice;
        if (nowAnime){
          if ((99+ind) > oldYearChoice){ //選擇106年原本103
            var gap = (99+ind) - oldYearChoice;
            if((99+ind) == 108){ //選擇在邊界時
              nodeList[0] = t;
              tmp = t;
              for(var k = 1; k < gap; k++){ //105 104 103
                tmp = tmp.prev();
                nodeList[k] = tmp;
              }
            }else{
              var tmp = t.next();
              for(var k = 0; k < gap; k++){ //105 104 103
                tmp = tmp.prev();
                nodeList[k] = tmp;
              }
            }
          }else{
            var gap = oldYearChoice - (99+ind); //選擇103年原本106
            if((99+ind) == 99){ //選擇在邊界時
              nodeList[0] = t;
              tmp = t;
              for(var k = 1; k < gap; k++){ //105 104 103
                tmp = tmp.next();
                nodeList[k] = tmp;
              }
            }else{
              var tmp = t.prev() //102
              for(var k = 0; k < gap; k++){ //103 104 105 107 108
                tmp = tmp.next();
                nodeList[k] = tmp;
              }
            }
          }
        }
        if(nowCounty && !nowAnime){
          t.add(matchedPara).addClass('active');
          inputs.not(t).add(paras.not(matchedPara)).removeClass('active');
          yearChoice =  99 + Number(t.index());
          updateCountyMap(nowDiseaseIndex, yearChoice);
          d3.select('#yearStr').text("民國" + yearChoice + "年");
          drawBarChart(chooseEnviromentData(nowEnvIndex, yearChoice), nowEnvIndex);
        }else if(nowCounty && nowAnime){
          if(oldYearChoice < (99 + Number(t.index()))){   //選擇比現代大的年份
            var counter = (99+ind) - oldYearChoice - 1;
            for(let i = oldYearChoice + 1; i <= 99 + Number(t.index()); i++){
              setTimeout(function(){
                drawBarChart(chooseEnviromentData(nowEnvIndex, i), nowEnvIndex);
                nodeList[counter].add(paras.eq(i - 99)).addClass('active');
                inputs.not(nodeList[counter]).add(paras.not(paras.eq(i - 99))).removeClass('active');
                counter--;
                updateCountyMap(nowDiseaseIndex, i);
                d3.select('#yearStr').text("民國" + i + "年");

              }, 2000*(i - oldYearChoice-1));
            }
          }else{
            var counter = oldYearChoice - (99+ind) - 1;
            for(let i = oldYearChoice - 1; i >= 99 + Number(t.index()); i--){
              setTimeout(function(){
                updateCountyMap(nowDiseaseIndex, i);
                nodeList[counter].add(paras.eq(i - 99)).addClass('active');
                inputs.not(nodeList[counter]).add(paras.not(paras.eq(i - 99))).removeClass('active');
                counter--;
                d3.select('#yearStr').text("民國" + i + "年");
                drawBarChart(chooseEnviromentData(nowEnvIndex, i), nowEnvIndex);
              }, 2000*(yearChoice-i-1));
            }
          }
          yearChoice =  99 + Number(t.index());
        }else if (!nowCounty && !nowAnime){
          yearChoice =  99 + Number(t.index());
          drawBarChart(chooseEnviromentData(nowEnvIndex, yearChoice), nowEnvIndex);
          d3.select('#yearStr').text("民國" + yearChoice + "年");
          t.add(matchedPara).addClass('active');
          inputs.not(t).add(paras.not(matchedPara)).removeClass('active');
          updateDistrictMap(nowDiseaseIndex, yearChoice);
        }else if (!nowCounty && nowAnime){
            if(oldYearChoice < (99 + Number(t.index()))){
              var counter = (99+ind) - oldYearChoice - 1;
              for(let i = oldYearChoice + 1; i <= 99 + Number(t.index()); i++){
                setTimeout(function(){
                  drawBarChart(chooseEnviromentData(nowEnvIndex, i), nowEnvIndex);
                  d3.select('#yearStr').text("民國" + i + "年");
                  nodeList[counter].add(paras.eq(i - 99)).addClass('active');
                  inputs.not(nodeList[counter]).add(paras.not(paras.eq(i - 99))).removeClass('active');
                  counter--;
                  updateDistrictMap(nowDiseaseIndex, i);
                }, 2000*(i - oldYearChoice-1));
              }
            }else{
              var counter = oldYearChoice - (99+ind) - 1;
              for(let i = oldYearChoice - 1; i >= 99 + Number(t.index()); i--){
                setTimeout(function(){
                  drawBarChart(chooseEnviromentData(nowEnvIndex, i), nowEnvIndex);
                  nodeList[counter].add(paras.eq(i - 99)).addClass('active');
                  inputs.not(nodeList[counter]).add(paras.not(paras.eq(i - 99))).removeClass('active');
                  counter--;
                  d3.select('#yearStr').text("民國" + i + "年");
                  updateDistrictMap(nowDiseaseIndex, i);
                }, 2000*(yearChoice-i-1));
              }
            }
            yearChoice =  99 + Number(t.index());
    	  }

    });
  });

    const getRateColor = nowCaseRate => {
        var redList = ['#AB3B3A', '#CB4042', '#DB4D6D','#E87A90', '#F4A7B9', '#FEDFE1'];
        var rlt = '#FFFFFF';
        if(nowCaseRate > 2){
            rlt = redList[0];
        }else if(nowCaseRate > 1 && nowCaseRate <= 2){
    		    rlt = redList[1];
        }else if(nowCaseRate > 0 && nowCaseRate <= 1){
    		    rlt = redList[2];
        }else if(nowCaseRate > -1 && nowCaseRate <= 0){
    		    rlt = redList[3];
        }else if(nowCaseRate > -2 && nowCaseRate <= -1){
            rlt = redList[4];
        }else{
            rlt = redList[5];
        }
        return rlt;
    };

    const getNumColor = (nowCaseNum, standard, stdGap) => {
        var redList = ['#AB3B3A', '#CB4042', '#DB4D6D','#E87A90', '#F4A7B9', '#FEDFE1'];
        var rlt = '#FFFFFF';
        if(nowCaseNum > standard+stdGap*2){
            rlt = redList[0];
        }else if(nowCaseNum > standard+stdGap*1 && nowCaseNum <= standard+stdGap*2){
    		    rlt = redList[1];
        }else if(nowCaseNum > standard && nowCaseNum <= standard+stdGap*1){
    		    rlt = redList[2];
        }else if(nowCaseNum > standard-stdGap*1 && nowCaseNum <= standard){
    		    rlt = redList[3];
        }else if(nowCaseNum > standard-stdGap*2 && nowCaseNum <= standard-stdGap*1){
            rlt = redList[4];
        }else{
            rlt = redList[5];
        }
        return rlt;
    };


    const getRegionData = (townName, nowNum) => {
        rlt = []
        values[nowNum].forEach((town) => {
          if (town.Region == townName) {
            rlt = town
          }
        });
        return rlt
    };

    const getCountyData = (countyName, nowNum) => {
        rlt = []
        values[nowNum].forEach((town) => {
          if (town.city == countyName) {
            rlt = town
          }
        });
        return rlt
      };

    var div = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

    const regionTopo = topojson.feature(values[0], values[0].objects.TOWN_MOI_1090324);
    const countyTopo = topojson.feature(values[8], values[8].objects.COUNTY_MOI_1090820);

    updateCountyMap(0, yearChoice);
    const deathData = getCountyData("臺北市", 9);
    drawLineChart(catchDiseaseYearData(deathData), getAverageData(0));
    drawBarChart(chooseEnviromentData(0,yearChoice), 0);
    function updateCountyMap(index, nowYear) {
        if(index < 7){
          nowDiseaseData = Number(index) + 9;
        }
        svg.selectAll('path').remove();
        svg.selectAll('path')
          .data(countyTopo.features)
          .enter()
          .append('path')
          .attr('d', path)
          .attr('id', d => `r-${d.properties.CITYNAME}`)
          .attr('class', 'map-region')
          .attr('fill', d => {
            const deathData = getCountyData(d.properties.CITYNAME, nowDiseaseData);
            if (nowTypeRate) {
              var nowZ = "rate_z_" + nowYear;
              return getRateColor(deathData[nowZ]);
            }else{
              var nowN = "num_" + nowYear;
              return getNumColor(deathData[nowN], 600, 200);
            }

          })
          .on('mouseover', function(d) {
            const deathData = getCountyData(d.properties.CITYNAME, nowDiseaseData);
            var nowNum = "num_" + nowYear;
            var nowRate = "struct_"+ nowYear;
            div.transition()
               .duration(200)
               .style("opacity", .9);
            div.html(`${d.properties.CITYNAME}<br>
                        死亡人數 ${deathData[nowNum]}  人<br>
                        死亡率 ${deathData[nowRate]}  %`)
              .style("left", (d3.event.pageX) + "px")
              .style("top", (d3.event.pageY + 20) + "px");

          })
          .on("mouseout", function(d) {
                div.transition()
                   .duration(500)
                   .style("opacity", 0);
          }).on("click", function(d) {
              d3.select('#region').text(`${d.properties.CITYNAME}`);
              const deathData = getCountyData(d.properties.CITYNAME, nowDiseaseData);
              drawLineChart(catchDiseaseYearData(deathData), getAverageData(nowDiseaseIndex));
              if (nowTypeRate){
                d3.select('#diseaseName').text(diseaseChineseName[nowDiseaseIndex] + " 歷年死亡率");
              }else{
                d3.select('#diseaseName').text(diseaseChineseName[nowDiseaseIndex] + " 歷年死亡人數");
              }
          });

          if (waterSwitch){
            svg.selectAll('circle.water').remove();
            var tmpStrWater = "year_" + yearChoice;
            d3.json("data/RPI.json").then(function(data) {
            svg.selectAll("myCircles")
              .data(data)
              .enter()
              .append("circle")
                .attr("class", "water")
                .attr("cx", function(d){
                  return projection([d.lng, d.lat])[0] })
                .attr("cy", function(d){ return projection([d.lng, d.lat])[1] })
                .attr("r", function(d){
                  var waterMin = Math.min(d[tmpStrWater]);
                  var waterMax = Math.max(d[tmpStrWater]);
                  size = d3.scaleLinear()
                        .domain([waterMin, waterMax])  // What's in the data
                        .range([1, waterMax*10]);
                  return size(d[tmpStrWater])})
                .style("fill", "#3A8FB7")
                .attr("stroke","#3A8FB7")
                .attr("stroke-width", 2)
                .attr("fill-opacity", .3)
                .on('mouseover', function(d) {
                  d3.select(this).style("fill", "#FFFFFF");
                  div.transition()
                     .duration(200)
                     .style("opacity", .9);
                  div.html(`河流名稱: ${d.river}<br>
                              汙染指數RPI: ${d[tmpStrWater]}`)
                    .style("left", (d3.event.pageX + 20) + "px")
                    .style("top", (d3.event.pageY + 20) + "px");

                }).on("mouseout", function(d) {
                      d3.select(this).style("fill", "#3A8FB7");
                      div.transition()
                         .duration(500)
                         .style("opacity", 0);
                  });
                });
          }else{
            svg.selectAll('circle.water').remove();
          }
          if (airSwitch){
            svg.selectAll('circle.air').remove();
            var tmpStrAir = "avg_" + yearChoice;
            d3.json("data/aqi.json").then(function(data) {
            svg.selectAll("myCircles")
              .data(data)
              .enter()
              .append("circle")
                .attr("class", "air")
                .attr("cx", function(d){
                  return projection([d.lng, d.lat])[0] })
                .attr("cy", function(d){ return projection([d.lng, d.lat])[1] })
                .attr("r", function(d){
                  var airMin = Math.min(d[tmpStrAir]);
                  var airMax = Math.max(d[tmpStrAir]);
                  size = d3.scaleLinear()
                        .domain([airMin, airMax])  // What's in the data
                        .range([1, airMax]);
                  return size(d[tmpStrAir])})
                .style("fill", "#24936E")
                .attr("stroke", "#24936E")
                .attr("stroke-width", 2)
                .attr("fill-opacity", .3)
                .on('mouseover', function(d) {
                  d3.select(this).style("fill", "#FFFFFF");
                  var strAQI = "avg_" + yearChoice;
                  div.transition()
                     .duration(200)
                     .style("opacity", .9);
                  div.html(`測站名稱: ${d.station_name}<br>
                              測站地點: ${d.county}<br>
                              汙染指數AQI: ${d[strAQI]}`)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY + 20) + "px");

                }).on("mouseout", function(d) {
                    d3.select(this).style("fill", "#24936E");
                      div.transition()
                         .duration(500)
                         .style("opacity", 0);
                  });
            });
          }else{
            svg.selectAll('circle.air').remove();
          }
          if (oriRaceSwitch){
            svg.selectAll('circle.oriRace').remove();
            var tmpStrOriRace = "pop_" + yearChoice;
            d3.json("data/indigenous.json").then(function(data) {
            svg.selectAll("myCircles")
              .data(data)
              .enter()
              .append("circle")
                .attr("class", "oriRace")
                .attr("cx", function(d){
                  return projection([d.lng, d.lat])[0] })
                .attr("cy", function(d){ return projection([d.lng, d.lat])[1] })
                .attr("r", function(d){
                  var raceMin = Math.min(d[tmpStrOriRace]);
                  var raceMax = Math.max(d[tmpStrOriRace]);
                  size = d3.scaleLinear()
                        .domain([raceMin, raceMax])  // What's in the data
                        .range([1, raceMax/300]);
                  return size(d[tmpStrOriRace])})
                .style("fill", "#DAC9A6")
                .attr("stroke","#DAC9A6")
                .attr("stroke-width", 2)
                .attr("fill-opacity", .3)
                .on('mouseover', function(d) {
                  d3.select(this).style("fill", "#535953");
                  var strRacePeople = "pop_" + yearChoice;
                  div.transition()
                     .duration(200)
                     .style("opacity", .9);
                  div.html(`${d.city} ${d.township}<br>
                              原住民人口數: ${d[strRacePeople]} 人`)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY + 20) + "px");

                }).on("mouseout", function(d) {
                    d3.select(this).style("fill", "#DAC9A6");
                      div.transition()
                         .duration(500)
                         .style("opacity", 0);
                  });
                });
          }else{
            svg.selectAll('circle.oriRace').remove();
          }
          if (smokeSwitch){
            svg.selectAll('circle.smoke').remove();
            var tmpStrSmoke = "year_" + yearChoice;
            d3.json("data/smoke.json").then(function(data) {
            svg.selectAll("myCircles")
              .data(data)
              .enter()
              .append("circle")
                .attr("class", "smoke")
                .attr("cx", function(d){
                  return projection([d.lng, d.lat])[0] })
                .attr("cy", function(d){ return projection([d.lng, d.lat])[1] })
                .attr("r", function(d){
                  var smokeMin = Math.min(d[tmpStrSmoke]);
                  var smokeMax = Math.max(d[tmpStrSmoke]);
                  size = d3.scaleLinear()
                        .domain([smokeMin, smokeMax])  // What's in the data
                        .range([1, smokeMax*2.5]);
                  return size(d[tmpStrSmoke])})
                .style("fill", "#ED784A")
                .attr("stroke", "#ED784A")
                .attr("stroke-width", 2)
                .attr("fill-opacity", .3)
                .on('mouseover', function(d) {
                  d3.select(this).style("fill", "#FFFFFF");
                  var strSmokePeople = "year_" + yearChoice;
                  div.transition()
                     .duration(200)
                     .style("opacity", .9);
                  div.html(`${d.city}<br>
                              吸菸比率: ${d[strSmokePeople]}%`)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY + 20) + "px");

                }).on("mouseout", function(d) {
                  d3.select(this).style("fill", "#ED784A");
                      div.transition()
                         .duration(500)
                         .style("opacity", 0);
                  });
                });
          }else{
            svg.selectAll('circle.smoke').remove();
          }
        svg.append('path')
            .datum(countyTopo)
            .attr('d', path)
            .attr('class', 'map-county-boundary');

      }
      function updateDistrictMap(index, nowYear) {

          if(index < 7){
            nowDiseaseData = Number(index) + 1;
          }
          svg.selectAll('path').remove();
          svg.selectAll('path')
            .data(regionTopo.features)
            .enter()
            .append('path')
            .attr('d', path)
            .attr('id', d => `r-${d.properties.TOWNNAME}`)
            .attr('class', 'map-region')
            .attr('fill', d => {
                const deathData = getRegionData(d.properties.TOWNNAME, nowDiseaseData);
                if (nowTypeRate) {
                  var nowZ = "rate_z_" + nowYear;
                  return getRateColor(deathData[nowZ]);
                }else{
                  var nowN = "num_" + nowYear;
                  return getNumColor(deathData[nowN], 36, 18);
                }
            })
              .on('mouseover', function(d) {
                const deathData = getRegionData(d.properties.TOWNNAME, nowDiseaseData);
                var nowNum = "num_" + nowYear;
                var nowRate = "struct_"+ nowYear;
                div.transition()
                    .duration(200)
                    .style("opacity", .9);

                div.html(`${d.properties.COUNTYNAME} ${d.properties.TOWNNAME} <br>
                            死亡人數 ${deathData[nowNum]}  人<br>
                            死亡率 ${deathData[nowRate]} %`)
                  .style("left", (d3.event.pageX + 20) + "px")
                  .style("top", (d3.event.pageY + 20) + "px");

              })
              .on("mouseout", function(d) {
                  div.transition()
                      .duration(500)
                      .style("opacity", 0);
              })
              .on("click", function(d){
                d3.select('#region').text(`${d.properties.COUNTYNAME} ${d.properties.TOWNNAME}`);
                const deathData = getRegionData(d.properties.TOWNNAME, nowDiseaseData);
                drawLineChart(catchDiseaseYearData(deathData), getAverageData(nowDiseaseIndex));
                if (nowTypeRate){
                  d3.select('#diseaseName').text(diseaseChineseName[nowDiseaseIndex] +" 歷年死亡率");
                }else{
                  d3.select('#diseaseName').text(diseaseChineseName[nowDiseaseIndex] +" 歷年死亡人數");
                }
              });

              if (waterSwitch){
                svg.selectAll('circle.water').remove();
                var tmpStrWater = "year_" + yearChoice;
                d3.json("data/RPI.json").then(function(data) {
                svg.selectAll("myCircles")
                  .data(data)
                  .enter()
                  .append("circle")
                    .attr("class", "water")
                    .attr("cx", function(d){
                      return projection([d.lng, d.lat])[0] })
                    .attr("cy", function(d){ return projection([d.lng, d.lat])[1] })
                    .attr("r", function(d){
                      var waterMin = Math.min(d[tmpStrWater]);
                      var waterMax = Math.max(d[tmpStrWater]);
                      size = d3.scaleLinear()
                            .domain([waterMin, waterMax])  // What's in the data
                            .range([1, waterMax*10]);
                      return size(d[tmpStrWater])})
                    .style("fill", "#3A8FB7")
                    .attr("stroke","#3A8FB7")
                    .attr("stroke-width", 2)
                    .attr("fill-opacity", .3)
                    .on('mouseover', function(d) {
                      d3.select(this).style("fill", "#FFFFFF");
                      div.transition()
                         .duration(200)
                         .style("opacity", .9);
                      div.html(`河流名稱: ${d.river}<br>
                                  汙染指數RPI: ${d[tmpStrWater]}`)
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY + 20) + "px");

                    }).on("mouseout", function(d) {
                          d3.select(this).style("fill", "#3A8FB7");
                          div.transition()
                             .duration(500)
                             .style("opacity", 0);
                      });
                    });
              }else{
                svg.selectAll('circle.water').remove();
              }
              if (airSwitch){
                svg.selectAll('circle.air').remove();
                var tmpStrAir = "avg_" + yearChoice;
                d3.json("data/aqi.json").then(function(data) {
                svg.selectAll("myCircles")
                  .data(data)
                  .enter()
                  .append("circle")
                    .attr("class", "air")
                    .attr("cx", function(d){
                      return projection([d.lng, d.lat])[0] })
                    .attr("cy", function(d){ return projection([d.lng, d.lat])[1] })
                    .attr("r", function(d){
                      var airMin = Math.min(d[tmpStrAir]);
                      var airMax = Math.max(d[tmpStrAir]);
                      size = d3.scaleLinear()
                            .domain([airMin, airMax])  // What's in the data
                            .range([1, airMax]);
                      return size(d[tmpStrAir])})
                    .style("fill", "#24936E")
                    .attr("stroke", "#24936E")
                    .attr("stroke-width", 2)
                    .attr("fill-opacity", .3)
                    .on('mouseover', function(d) {
                      d3.select(this).style("fill", "#FFFFFF");
                      var strAQI = "avg_" + yearChoice;
                      div.transition()
                         .duration(200)
                         .style("opacity", .9);
                      div.html(`測站名稱: ${d.station_name}<br>
                                  測站地點: ${d.county}<br>
                                  汙染指數AQI: ${d[strAQI]}`)
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY + 20) + "px");

                    }).on("mouseout", function(d) {
                        d3.select(this).style("fill", "#24936E");
                          div.transition()
                             .duration(500)
                             .style("opacity", 0);
                      });
                });
              }else{
                svg.selectAll('circle.air').remove();
              }
              if (oriRaceSwitch){
                svg.selectAll('circle.oriRace').remove();
                var tmpStrOriRace = "pop_" + yearChoice;
                d3.json("data/indigenous.json").then(function(data) {
                svg.selectAll("myCircles")
                  .data(data)
                  .enter()
                  .append("circle")
                    .attr("class", "oriRace")
                    .attr("cx", function(d){
                      return projection([d.lng, d.lat])[0] })
                    .attr("cy", function(d){ return projection([d.lng, d.lat])[1] })
                    .attr("r", function(d){
                      var raceMin = Math.min(d[tmpStrOriRace]);
                      var raceMax = Math.max(d[tmpStrOriRace]);
                      size = d3.scaleLinear()
                            .domain([raceMin, raceMax])  // What's in the data
                            .range([1, raceMax/300]);
                      return size(d[tmpStrOriRace])})
                    .style("fill", "#DAC9A6")
                    .attr("stroke","#DAC9A6")
                    .attr("stroke-width", 2)
                    .attr("fill-opacity", .3)
                    .on('mouseover', function(d) {
                      d3.select(this).style("fill", "#535953");
                      var strRacePeople = "pop_" + yearChoice;
                      div.transition()
                         .duration(200)
                         .style("opacity", .9);
                      div.html(`${d.city} ${d.township}<br>
                                  原住民人口數: ${d[strRacePeople]} 人`)
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY + 20) + "px");

                    }).on("mouseout", function(d) {
                        d3.select(this).style("fill", "#DAC9A6");
                          div.transition()
                             .duration(500)
                             .style("opacity", 0);
                      });
                    });
              }else{
                svg.selectAll('circle.oriRace').remove();
              }
              if (smokeSwitch){
                svg.selectAll('circle.smoke').remove();
                var tmpStrSmoke = "year_" + yearChoice;
                d3.json("data/smoke.json").then(function(data) {
                svg.selectAll("myCircles")
                  .data(data)
                  .enter()
                  .append("circle")
                    .attr("class", "smoke")
                    .attr("cx", function(d){
                      return projection([d.lng, d.lat])[0] })
                    .attr("cy", function(d){ return projection([d.lng, d.lat])[1] })
                    .attr("r", function(d){
                      var smokeMin = Math.min(d[tmpStrSmoke]);
                      var smokeMax = Math.max(d[tmpStrSmoke]);
                      size = d3.scaleLinear()
                            .domain([smokeMin, smokeMax])  // What's in the data
                            .range([1, smokeMax*2.5]);
                      return size(d[tmpStrSmoke])})
                    .style("fill", "#ED784A")
                    .attr("stroke", "#ED784A")
                    .attr("stroke-width", 2)
                    .attr("fill-opacity", .3)
                    .on('mouseover', function(d) {
                      d3.select(this).style("fill", "#FFFFFF");
                      var strSmokePeople = "year_" + yearChoice;
                      div.transition()
                         .duration(200)
                         .style("opacity", .9);
                      div.html(`${d.city}<br>
                                  吸菸比率: ${d[strSmokePeople]}%`)
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY + 20) + "px");

                    }).on("mouseout", function(d) {
                      d3.select(this).style("fill", "#ED784A");
                          div.transition()
                             .duration(500)
                             .style("opacity", 0);
                      });
                    });
              }else{
                svg.selectAll('circle.smoke').remove();
              }
            svg.append('path')
              .datum(regionTopo)
              .attr('d', path)
              .attr('class', 'map-county-boundary')
              .attr('id', d => {
              console.log(d);
              return `r-${d.properties.TOWNID}`
            });
        }
});
