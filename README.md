# 20_g575_MissingPersonsViz

### TeamMembers

* Josh Seibel
* Christopher Pierson
* Hayley Corson-Dosch

### Definitions
* **Missing Person:** A person who has disappeared and may be alive or deceased. 
* **Unidentified Person:** A deceased person whose legal identity is unknown (Jane or John Doe).
* **Unclaimed Person:** A deceased person with a known name, but with no known next of kin, or family member, who could claim the deceased's body for burial or disposal.

### Final Project
1. **Target User Profile (Persona)**
      * **Person 1:** Public user interested in missing persons
      * **Name:** John Doe
      * **Background Description:** John Doe is a 35-year-old taxi driver. When he was 13, his 17-year-old cousin Anabelle went missing from Albuquerque, New Mexico, her hometown. The local police department received a few tips suggesting that she had been seen in nearby Santa Fe, but she was never found. The loss of Anabelle greatly affected John and his family, and since that time John has been interested in cases of missing people.
      
         Over the years he has used sites such as NamUs.gov to track and query data about missing people. However, he finds it difficult to **_filter_** the data by factors the he feels are important, such as age, race/ethnicity, location last seen, and number of years that the person has been missing. He also finds it hard to **_visualize_** the spatial distribution of missing cases, because all the data are stored in tabular format, and the available map cannot be interactively filtered, and poorly displays the data.
         
         He would like to be able to visualize the data at different scales – state, county, and by city. He would like to be able to **_filter_** the data that is displayed by age, race/ethnicity, number of years missing, and other attributes. He would also like to be able to **_search_** for individuals using their given name, the case number, or the location (state, county, or city) where they were last seen.
         
         With these filters in place, he would like to be able to **_compare_** and **_rank_** cases that fit the set criteria in up to 3 different states, counties, or cities. In doing so, he would like to be able to see raw totals for each selected location, normalized numbers for comparison, and details about how each state/county/city reports missing people. In a dropdown menu, he would also like to be able to **_identify_** information about the names and characteristics of all the missing people in those cities/counties/states.
         
         For his cousin’s case specifically, he would like to be able to **_identify_** what information about her case is publicly available, either by searching for her case, or by clicking on the icon the map that represents her case and the location where she was last seen. He would then like to be able to access the specific case file by clicking on a link to an external website.
         
         
         
2. **User Case Scenarios**
      * **Scenario 1:** This person wants to **_identify_** women who went missing in the city of Philadelphia, Pennsylvania between the age of 18 and 30. Upon arriving at the website, an interested person is presented with a disclaimer about the data and use of the website. They are informed that the data originates from Namus and does not include all information, which data can be selected and info about it, and generally how to use the website. They click on the ‘I understand’ button, and the disclaimer closes. The user sees that there is a search bar at the top of the screen, where the default option is to search for a specific place by name. The user clicks on the search bar and types in ‘Philadelphia, Pennsylvania’ and then hits the ‘enter’ button on their keyboard to perform the search. The map automatically zooms to Philadelphia, and the map level is automatically changed to ‘City level’, because they searched for a city. The map now displays proportional symbols indicating the number of missing people in Philadelphia and surrounding cities. The user wants to filter the data to only show missing cases of women between the ages of 18-30. They see that there is a menu tab in the upper right that says ‘Advanced filters’. They click on this tab, and a dropdown menu appears. They see that under the gender section, the radio button for ‘all’ is selected. They click on the radio button for ‘female’ and the map view resets to only display information about missing women. Under the ‘age at time of disappearance’ section in the filter menu, they uncheck the checkbox next to ‘All’ and check the checkbox next to ‘18 - 30’. The map view resets to only display information about missing women between the ages of 18 to 30. Now that the map is displaying the data that the user is interested in, they click on Philadelphia and an information panel pops up with summary information for Philadelphia. At the same time, a button appears at the bottom that says ‘view more data’. The user wants to retrieve information for Philadelphia, so they click on this button and the page automatically scrolls down, and the user sees a section with a detailed table for Philadelphia. The default view is a list of women who went missing in Philadelphia between the ages of 18 and 30.
      
      
      * **Scenario 2:** Person is curious about **_comparing_** which age groups are most likely to go missing in New York, California, and Texas. Upon arriving at the website, an interested person is presented with a disclaimer about the data and use of the website. They are informed that the data originates from Namus and does not include all information, which data can be selected and info about it, and generally how to use the website. The user clicks on the ‘I understand’ button, and the disclaimer closes, showing the default view of the map. An affordance pops up suggesting that the user start by clicking on the first menu tab (at the top of the page) and **_filtering_** what type of data they wish to show (missing person data or unidentified bodies data). Depending on which type of data is selected, the color of the data displayed will change, as a visual cue for what type of data is presented. The user selects missing person data. The user then uses the next tab to indicate that they wish to see data summarized at the state level. The missing persons data are now represented as a proportional symbol map, with the proportional symbols located at the centroid of each state. The user can visually **_rank_** the states based on the size of the proportional symbols. Because the user wishes to compare data from multiple states, they activate the toggle to indicate that they wish to retrieve summary statistics for more than one area. The user clicks on California, and an information panel pops up with summary statistics for the state. A button appears up at the bottom of the screen that says ‘view more data’. Before clicking on it, the user first clicks on Texas and then New York, and two more information panels pop up. As soon as the second information panel appeared, the text of the button changed to say ‘view full comparison’. Now that all three states have been selected, the user **_compares_** the summary statistics in the three information panels and decides that they want to see a full comparison between the states, so they click on the button that says ‘view full comparison’. The page automatically scrolls down, and the user sees a section with a detailed table for each of the three states. At the top of each table there is a label indicating for which state data is being reported. The default view is a list of missing people in each state. The user clicks on the toggle to jog the display to show summary statistics for each state, instead of a list of missing people. The tables now show the number of missing and unidentified people in each state, as well as values normalized to the state’s population for **_comparison_**. The tables also show demographic information about missing and unidentified persons in each state (e.g., percent of each race/ethnicity, percent male/female, percent within set age brackets). The user can **_rank_** and **_compare_** the three states using this information. _[STRETCH GOAL: The user also sees that there is an interactive graphic that plots the summary data from each state for comparison. Details of chart not yet confirmed]_.
      
      
3. **Requirements Document**
    1. **Representations**
        * **Basemap:** outline of the US (state boundaries needed, counties needed, urban area)
        * **Missing/Unclaimed/Unidentified Person Locations:** aggregated to state, county, urban area, etc _[STRETCH GOAL: coordinates as well if web-scraping NAMUS.gov is successful]_.
        * **Legend:** Visual description of the proportional symbols.
        * **Info Panels:** Summary information about the selected bin(s) - e.g., total number of missing people, number of missing people per 100,000 people. _[STRETCH GOAL: radar plot graph]_.
        * **More statistics:** Table with additional information, e.g, number of missing/unidentified persons, additional statistics.
        * _[STRETCH GOAL - **Timeline:** streamgraph or stacked bar graph]_. 
        * **Overview:** Documentation on background, data source, and user guidelines.
        
        
    2. **Interactions**
        * **Data Menu** - Filter: object. Change data that is displayed by proportional symbols (Missing Person, Unidentified Person, Unclaimed Person). 
        * **Map Level Menu** - Reexpress: object. Change enumeration unit of data (state, county, or city) _[STRETCH GOAL: resymbolize to point map with actual case location (for missing persons: last known location, for unidentified persons: location found, for unclaimed persons: location found)]_. 
        * **Advanced Filter** - Filter: attribute or time. Missing Person: Age when missing, Sex, Ethnicity, When Gone Missing (year and/or month). Unidentified Person: Approximate Age, Sex, Ethnicity, Date Body Found. Unclaimed Person: Age, Sex, Ethnicity, Date Body Found. 
        * **Search By** - Search: location or attribute. By Place (state, county, or city). By individual (name or case number). 
        * **Pan** - Scroll around map with mouse. 
        * **Zoom** - Zoom into a location with mouse or buttons on side. 
        * **Enumeration Unit Click** - Retrieve: object. Click on enumeration unit to display an information panel. Also autofills the table of information at the bottom of the page. Also triggers the appearance of a button at the bottom of a page that, when clicked, scrolls to this additional information. 
        * **View More Data** - Retrieve: object. If one enumeration unit is selected, click to scroll to additional information about the selected enumeration unit. _[STRETCH GOAL: if more than one enumeration unit is selected, click to scroll and compare information from the enumeration units]_. 
        * _[STRETCH GOAL: **Results Toggle** - Retrieve: object. Display either list of cases OR enumeration unit statistics below the map when an enumeration unit is clicked on. If Statistics is toggled, up to three enumeration units can be clicked, but filter becomes inactive]_.
        * **Data Visualization** - Resymbolize: objects. Below enumeration statistics, enumeration units can be displayed as graph bar or line graphs of when people went missing. Or how the number of missing people varied over time? _[STRETCH GOAL: coxcomb for enumeration unit, radar chart for enumeration unit]_.
        * _[STRETCH GOAL: **Share** - Export: attributes. Export csv of cases after enumerations were clicked and/or filters implemented]_. 
        * _[STRETCH GOAL: **Census Data** - Overlay: object. General demographic info]_. 

4. Wireframes
    * Similar to Eviction Lab. See folder in repository.
