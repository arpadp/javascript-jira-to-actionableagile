# javascript-jira-to-actionableagile

<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="https://arpadp.github.io/javascript-jira-to-actionableagile/" target="_blank">
    Project site
  </a>

  <h3 align="center">Javascript jira to actioableagile </h3>

  <p align="center">
    Simple javascript tool to convert jira data to actionableagile csv import format
    <br />
    <a href="https://github.com/arpadp/javascript-jira-to-actionableagile"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/arpadp/javascript-jira-to-actionableagile">View Demo</a>
    ·
    <a href="https://github.com/arpadp/javascript-jira-to-actionableagile/issues">Report Bug</a>
    ·
    <a href="https://github.com/arpadp/javascript-jira-to-actionableagile/issues">Request Feature</a>
  </p>
</p>



<!-- TABLE OF CONTENTS -->
<details open="open">
  <summary><h2 style="display: inline-block">Table of Contents</h2></summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgements">Acknowledgements</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

If you don't know about https://analytics.actionableagile.com go chek it out. Is a great toll. 
They also have a jira plugins and are very good and seamless to use. 

Sometimes one can't get the jira plugin, so the problem statement this thing solves is:
I want to have a data driven approach to view teams flow by using jira as the single point of truth and https://analytics.actionableagile.com to interpret the results. 
This tool is used to convert a json, from a jira rest api server, to a csv fomratted for analytics.


### Built With

* []()
* []()
* []()



<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running follow these simple steps.

### Prerequisites

No prereqisites needed, just open the site

### Installation

No installation needed, just open the site

<!-- USAGE EXAMPLES -->
## Usage

The tool works in three steps:
1. Setup the worklfow you want to use. The statuses have to match the exact jira text, and need to be separated by comma 
2. Query the jira server with an active session on a url like: https://jira.your.instance.com/rest/api/latest/search?jql=filter=28623&expand=changelog&maxResults=100 Note that you can change the jql query with whatever data you are interested in analysing. *Very important* to have the &expand=changelog parameter to have the history of the jira items, so that the script can look up dates on diferent workflow statuses. 
3. Copy paste the json in the textarea. For large json files, the textarea breaks. So I've added a simple python server to be used to stream the large file. This is for extreame cases, the standard input works well for ~150 issues.
4. Convert to CSV. Look into the code and change the statuses to match the actual workflow.



<!-- ROADMAP -->
## Roadmap

See the [open issues](https://github.com/arpadp/javascript-jira-to-actionableagile/issues) for a list of proposed features (and known issues).



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request



<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE` for more information.



<!-- CONTACT -->
## Contact

Arpad - Twitter     [@ArpadPiskolti](https://twitter.com/ArpadPiskolti) 
        Linkedin    [@ArpadPiskolti](https://linkedin.com/in/arpadpiskolti) 

Project Link: [https://github.com/arpadp/javascript-jira-to-actionableagile](https://github.com/arpadp/javascript-jira-to-actionableagile)



<!-- ACKNOWLEDGEMENTS -->
## Acknowledgements

* []()
* []()
* []()





<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/arpadp/repo.svg?style=for-the-badge
[contributors-url]: https://github.com/arpadp/javascript-jira-to-actionableagile/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/arpadp/repo.svg?style=for-the-badge
[forks-url]: https://github.com/arpadp/javascript-jira-to-actionableagile/network/members
[stars-shield]: https://img.shields.io/github/stars/arpadp/repo.svg?style=for-the-badge
[stars-url]: https://github.com/arpadp/javascript-jira-to-actionableagile/stargazers
[issues-shield]: https://img.shields.io/github/issues/arpadp/repo.svg?style=for-the-badge
[issues-url]: https://github.com/arpadp/javascript-jira-to-actionableagile/issues
[license-shield]: https://img.shields.io/github/license/arpadp/repo.svg?style=for-the-badge
[license-url]: https://github.com/arpadp/javascript-jira-to-actionableagile/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/arpadpiskolti
