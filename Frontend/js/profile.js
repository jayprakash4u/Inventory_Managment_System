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

const baseChartConfig = {
  toolbar: { show: false },
  colors: ["#246dec"],
  dataLabels: { enabled: false },
  stroke: { curve: "smooth" },
};

function renderSkillsChart() {
  const config = {
    series: [{ name: "Proficiency", data: skillsData.proficiency }],
    chart: { ...baseChartConfig, type: "radar", height: 350 },
    xaxis: { categories: skillsData.skills },
    yaxis: { min: 0, max: 100 },
    markers: { size: 4 },
  };
  new ApexCharts(document.querySelector("#skills-chart"), config).render();
}

function renderExperienceTimelineChart() {
  const config = {
    series: [{ name: "Years of Experience", data: experienceData.experience }],
    chart: { ...baseChartConfig, height: 350, type: "area" },
    xaxis: { categories: experienceData.periods },
    yaxis: { title: { text: "Years" } },
    tooltip: { shared: true },
  };
  new ApexCharts(
    document.querySelector("#experience-timeline-chart"),
    config,
  ).render();
}

function renderProjectsChart() {
  const config = {
    series: projectsData.counts,
    chart: { ...baseChartConfig, type: "pie", height: 350 },
    labels: projectsData.types,
    colors: ["#246dec", "#cc3c43", "#367952", "#f5b747", "#4f35a1"],
    responsive: [
      {
        breakpoint: 480,
        options: { chart: { width: 200 }, legend: { position: "bottom" } },
      },
    ],
  };
  new ApexCharts(document.querySelector("#projects-chart"), config).render();
}

function renderLearningChart() {
  const config = {
    series: [{ name: "Learning Progress", data: learningData.progress }],
    chart: { ...baseChartConfig, height: 350, type: "line" },
    xaxis: { categories: learningData.months },
    yaxis: { title: { text: "Progress (%)" }, min: 0, max: 100 },
    tooltip: { shared: true },
  };
  new ApexCharts(document.querySelector("#learning-chart"), config).render();
}

document.addEventListener("DOMContentLoaded", function () {
  renderSkillsChart();
  renderExperienceTimelineChart();
  renderProjectsChart();
  renderLearningChart();
});
