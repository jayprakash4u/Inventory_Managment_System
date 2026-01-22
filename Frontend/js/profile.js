// Profile page JavaScript

// Sample data for charts
const skillsData = {
  skills: ["JavaScript", "Python", "React", "Node.js", "SQL", "AWS"],
  proficiency: [85, 75, 80, 70, 90, 65],
};

const experienceData = {
  periods: ["2021", "2022", "2023", "2024"],
  experience: [0.5, 1, 1.5, 2],
};

const projectsData = {
  types: ["Web Apps", "APIs", "Mobile Apps", "Databases", "Tools"],
  counts: [8, 3, 2, 1, 1],
};

const learningData = {
  months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  progress: [20, 35, 50, 65, 80, 95],
};

// Render skills chart
function renderSkillsChart() {
  const config = {
    series: [
      {
        name: "Proficiency",
        data: skillsData.proficiency,
      },
    ],
    chart: {
      type: "radar",
      height: 350,
      toolbar: { show: false },
    },
    colors: ["#246dec"],
    xaxis: { categories: skillsData.skills },
    yaxis: { min: 0, max: 100 },
    markers: { size: 4 },
  };
  const chart = new ApexCharts(document.querySelector("#skills-chart"), config);
  chart.render();
}

// Render experience timeline chart
function renderExperienceTimelineChart() {
  const config = {
    series: [
      {
        name: "Years of Experience",
        data: experienceData.experience,
      },
    ],
    chart: {
      height: 350,
      type: "area",
      toolbar: { show: false },
    },
    colors: ["#246dec"],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth" },
    xaxis: { categories: experienceData.periods },
    yaxis: { title: { text: "Years" } },
    tooltip: { shared: true },
  };
  const chart = new ApexCharts(
    document.querySelector("#experience-timeline-chart"),
    config
  );
  chart.render();
}

// Render projects chart
function renderProjectsChart() {
  const config = {
    series: projectsData.counts,
    chart: {
      type: "pie",
      height: 350,
      toolbar: { show: false },
    },
    labels: projectsData.types,
    colors: ["#246dec", "#cc3c43", "#367952", "#f5b747", "#4f35a1"],
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: { width: 200 },
          legend: { position: "bottom" },
        },
      },
    ],
  };
  const chart = new ApexCharts(
    document.querySelector("#projects-chart"),
    config
  );
  chart.render();
}

// Render learning progress chart
function renderLearningChart() {
  const config = {
    series: [
      {
        name: "Learning Progress",
        data: learningData.progress,
      },
    ],
    chart: {
      height: 350,
      type: "line",
      toolbar: { show: false },
    },
    colors: ["#246dec"],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth" },
    xaxis: { categories: learningData.months },
    yaxis: { title: { text: "Progress (%)" }, min: 0, max: 100 },
    tooltip: { shared: true },
  };
  const chart = new ApexCharts(
    document.querySelector("#learning-chart"),
    config
  );
  chart.render();
}

// Initialize page
document.addEventListener("DOMContentLoaded", function () {
  renderSkillsChart();
  renderExperienceTimelineChart();
  renderProjectsChart();
  renderLearningChart();
});
