# The Analysis for the Diseases of Death in Taiwan over the Years

Demo video: https://youtu.be/MoAlIrJp-SA

Introduction
----
* ### Diseases of Death
  >The project is aim to analyze the relationship between top diseases of death and environmental factors. We showed the scale of death ratio or numbers of people on the map with the color intensity. In addition to understand the distribution of each disease, we can also realize the change of each disease in each year. Also, we pay attention to each region circumstances, which is concluded the changes over the years with line chart.

* ### Evironmental Factors
  >We divide the enviromental factors to two parts. One is the enviromental pollution, and the other is social humanities. We displayed the influence of each factor with bubble chart. The size of bubble represents different degree of the factor. For example, the air pollution factor is scaled by AQI and the smoking people factor is scaled by ratio of people. The position of bubbles is on the monitoring station location for pollution factors and is on the center of region for social humanities factors. Last but not least, we showed the places with top five scale score for each factors via bar chart to conclude the change of the enviroment. Overall, we may analyze diverse aspects of the relation to the environmental factors and diseases with the visualization result.

Technique
----
* ### Data
  >The disease and smoking data is from Ministry of Health and Welfare in Taiwan. The pollution data is from Evironmental Protection Administration, and indigenous population is from Ministry of the Interior. We formed the data to Json format. The data was set up in Js file with Document belonging to Web API. However, the map data was the topoJson format and set up with topoJson library.

* ### UI Operation
  >The animation and interaction with the user are mainly used the svg library based on D3 js. The method geoPath(), projection(), and etc., are contributed to the map operation. The regional disease data is dot on the line chart. The environmental data is read with the circle form to draw the bubble chart, and is concluded with bar chart. All the chart is drawed with svg library. To modify the attributes of the object, attr() method is used. To make it animated, transition() is applied.
 
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
  >If you wonder the pratical operation in details, you can watch demo video via above link.


