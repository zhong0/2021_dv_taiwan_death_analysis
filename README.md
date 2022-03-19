# The Analysis for the Diseases of Death in Taiwan over the Years

Demo video: https://youtu.be/MoAlIrJp-SA

Introduction
----
* ### Diseases of Death
  >The project is aim to analyze the relationship between top diseases of death and environmental factors in Taiwan. We display the scale of death ratio or numbers of people on the map with the color intensity. In addition to understand the region distribution of each disease, we can also realize the changes in each year. Also, we pay attention to each region circumstances, which is concluded the changes over the years with line chart.

* ### Environmental Factors
  >We divide the environmental factors to two parts. One is the environmental pollution, and the other is social humanities. We displayed the influence of each factor with bubble chart on the map. The size of bubble represents different degree with the factor. For example, the air pollution factor is scaled by AQI and the smoking people factor is scaled by ratio of people. The position of bubbles is on the monitoring station location for pollution factors and is on the center of region for social humanities factors. Last but not least, we showed the places with top five scale score for each factor via bar chart to conclude the changes of the environment. Overall, we may analyze diverse aspects of the relation to the environmental factors and diseases with the visualization result.

Technique
----
* ### Data
  > The disease and smoking data are from Ministry of Health and Welfare in Taiwan. The pollution data is from Environmental Protection Administration, and indigenous population is from Ministry of the Interior. We formed the data to Json format. The data was set  with Document function belonging to Web API in Javascript files. The map data is the topoJson format and set up with topoJson library.

* ### UI Operation
  > The animation and interaction with the user are mainly applied the svg library based on D3 js. The method geoPath(), projection(), and etc., are contributed to map operation. The regional disease data is dotted on the line chart. The environmental data converts to circle form to draw the bubble chart, and is concluded with bar chart. All the chart is drawn with svg library. To modify the attributes of the object, attr() method is used. To make it animated, transition() is applied.
 
* ### User Interface
  >The layout is arranged by html. The attributes are designed by css.

Environment
----
  >We didn't set public to this project. Therefore, we accessed to the localhost via Xampp. Then, we made Apache server enable. After moving all the files to the path /xampp/htdoc, the project can be implemented on your own pc.

Reference
----
* ### topoJson
  >https://gist.github.com/PM25/2674f28945c36a394aa4d4c9e410485a

Supplement
----
* ### document
  >The document file contains the presentation ppt for final project of data visualization courses. It is written in Chinese. If you want to understand our systems work in details, you can watch the demo video via above link.
