(function() {
    'use strict';
    
    angular.module('app').controller('StatsController', StatsController);
    
    StatsController.$inject = ['DataService','$log'];

    function StatsController(DataService,$log){
        var vm = this;
        var colors = ['#8dd3c7','#ffffb3','#bebada','#fb8072','#80b1d3','#fdb462','#b3de69'];
        
        vm.stats = null;
        vm.numberRecipes = null;
        vm.numberIngredients = null;
        vm.numberShoppingLists = null;
       
        vm.loading = false;

        _loadData();

        function _loadData() {

            vm.loading = true;
            DataService.getStats()
                .then(function(stats) {
                    vm.stats = stats;
                    vm.numberRecipes = stats['recipe_number'];
                    vm.numberIngredients = stats['ingredient_number'];
                    vm.numberShoppingLists = stats['shoppingList_number'];
                    showRecipes("#recipeStatPanel");
                    showIngredients('#ingredientsStatPanel');
                })
                .catch(function(error){
                    $log.error('Could not load recipe list');
                })
                .finally(function(){
                    vm.loading = false;
                });
        }

        function showRecipes(elementPath){

            var data = vm.stats.recipes;

            var width = 250,
                height = 250,
                radius = Math.min(width, height) / 2;
            
            var color = d3.scaleOrdinal()
                .range(colors);

            var arc = d3.arc()
                .outerRadius(radius - 10)
                .innerRadius(radius - 70);

            var pie = d3.pie()
                .value(function(d) { return d.recipes; });

            var svg = d3.select(elementPath).append("svg")
                .attr("width", width)
                .attr("height", height)
              .append("g")
                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
                
            var g = svg.selectAll(".arc")
              .data(pie(data))
            .enter().append("g")
              .attr("class", "arc");

              g.append("path")
                  .attr("d", arc)
                  .style("fill", function(d) { return color(d.data.category); });

              g.append("text")
                  .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
                  .attr("dy", ".35em")
                  .attr("font-family", "sans-serif")
                  .style("font-size", "15px")
                  .text(function(d) { return d.data.category; });
 
              g.append("text")
                  .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
                  .attr("dy", "1.75em")
                  .text(function(d) { return "(" + d.data.recipes + ")"; });
        }

        function showIngredients(elementPath){

            var data = vm.stats.ingredients
                        .filter(function(d) { return d.recipes > 0 }) 
                        .sort(function(a, b) { 
                            return d3.descending(a.recipes, b.recipes); 
                        });

            var width = 250,
                barHeight = 20;

            var x = d3.scaleLinear()
                .domain([0,d3.max(data, function(d){return d.recipes})])
                .range([0, width]);

            var chart =  d3.select(elementPath).append("svg")
                .attr("width", width)
                .attr("height", barHeight * data.length);
            
            //---------- header
            chart.append("g")
                .append("rect")
                .attr("width", width)
                .attr("height", barHeight - 1)
                .attr("fill", "steelblue" );

            chart.append("text")
                .attr("x", 3)
                .attr("y", barHeight / 2)
                .attr("dy", ".35em")
                .attr("fill", "white" )
                .text("ingredient");

            chart.append("text")
                .attr("x", width - 3)
                .attr("y", barHeight / 2)
                .attr("dy", ".35em")
                .attr("style", "text-anchor: end")
                .attr("fill", "white" )
                .text("#recipes");
            
            //----------- ingredients
            var bar = chart.selectAll("g")
                .data(data)
            .enter().append("g")
                .attr("transform", function(d, i) { return "translate(0," + i * barHeight + ")"; });

            bar.append("rect")
                .attr("width", function(d) { return x(d.recipes); })
                .attr("height", barHeight - 1)
                .attr("fill", "#a6cee3" );

            bar.append("line")
                .attr("x1",0)
                .attr("y1", barHeight - 1)
                .attr("x2", width)
                .attr("y2", barHeight - 1)
                .attr("stroke", "#80b1d3" );

            bar.append("text")
                .attr("x", 3)
                .attr("y", barHeight / 2)
                .attr("dy", ".35em")
                .text(function(d) { return d.ingredient; })
            
            bar.append("text")
                .attr("x", width - 3)
                .attr("y", barHeight / 2)
                .attr("dy", ".35em")
                .attr("style", "text-anchor: end")
                .text(function(d) { return d.recipes; });
        }
        
    };
})();