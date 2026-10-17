
/*
  SMART DRAIN MONITOR
  Demo version using OpenStreetMap + Leaflet.

  NOTE:
  These are simulated readings, not live ESP32 sensor data.
*/

const drains = [
  {
    id: "DR-001",
    name: "Campus Main Gate (demo)",
    latitude: 12.9345,
    longitude: 77.5347,
    waterLevel: 25,
    status: "NORMAL",
    updatedAt: "Demo reading"
  },
  {
    id: "DR-002",
    name: "Campus Parking Area (demo)",
    latitude: 12.9352,
    longitude: 77.5360,
    waterLevel: 68,
    status: "WARNING",
    updatedAt: "Demo reading"
  },
  {
    id: "DR-003",
    name: "Campus Hostel Road (demo)",
    latitude: 12.9338,
    longitude: 77.5370,
    waterLevel: 92,
    status: "HIGH_RISK",
    updatedAt: "Demo reading"
  }
];

let map;
const markersById = new Map();

// Return a colour based on drain status.
function statusColor(status) {
  if (status === "HIGH_RISK") {
    return "#e84855";
  }

  if (status === "WARNING") {
    return "#f2b632";
  }

  return "#27ae70";
}

// Make status easier to read.
function readableStatus(status) {
  return status.replaceAll("_", " ");
}

// Update the three summary counters.
function renderSummary() {
  document.getElementById("totalDrains").textContent =
    drains.length;

  document.getElementById("warningCount").textContent =
    drains.filter(d => d.status === "WARNING").length;

  document.getElementById("highRiskCount").textContent =
    drains.filter(d => d.status === "HIGH_RISK").length;

  document.getElementById("updated").textContent =
    "Demo data loaded — not live sensor data";
}

// Display a card for each drain.
function renderDrainCards() {
  const list = document.getElementById("drainList");

  list.replaceChildren();

  drains.forEach(drain => {
    const card = document.createElement("button");

    card.type = "button";
    card.className = "drain-card";

    card.style.setProperty(
      "--status-color",
      statusColor(drain.status)
    );

    card.setAttribute(
      "aria-label",
      `Show ${drain.id} on map`
    );

    const title = document.createElement("h3");
    title.textContent = `${drain.id} — ${drain.name}`;

    const level = document.createElement("p");
    level.textContent = `Water level: ${drain.waterLevel}%`;

    const updated = document.createElement("p");
    updated.textContent = `Updated: ${drain.updatedAt}`;

    const status = document.createElement("span");
    status.className = "status-pill";
    status.textContent = readableStatus(drain.status);

    card.append(title, level, updated, status);

    // Clicking a card focuses its map marker.
    card.addEventListener("click", () => {
      const marker = markersById.get(drain.id);

      if (marker && map) {
        map.setView(
          [drain.latitude, drain.longitude],
          18
        );

        marker.openPopup();
      }
    });

    list.appendChild(card);
  });
}

// Create safe popup content for each map marker.
function createPopupContent(drain) {
  const container = document.createElement("div");

  const title = document.createElement("strong");
  title.textContent = `${drain.id}: ${drain.name}`;

  const level = document.createElement("p");
  level.textContent = `Water level: ${drain.waterLevel}%`;

  const status = document.createElement("p");
  status.textContent =
    `Status: ${readableStatus(drain.status)}`;

  const note = document.createElement("small");
  note.textContent =
    "Simulated demo data — not a live reading.";

  container.append(title, level, status, note);

  return container;
}

// Create the OpenStreetMap.
function initDrainMap() {
  const mapElement = document.getElementById("map");

  if (!mapElement) {
    throw new Error(
      'Could not find the element with id="map".'
    );
  }

  // Check whether Leaflet loaded correctly.
  if (typeof L === "undefined") {
    mapElement.textContent =
      "Map library failed to load. Check your internet connection and refresh.";
    mapElement.style.padding = "24px";
    return;
  }

  // Centre the map on the sample locations.
  map = L.map("map").setView(
    [12.9345, 77.5360],
    16
  );

  // Load OpenStreetMap tiles.
  L.tileLayer(
    "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }
  ).addTo(map);

  // Add coloured markers for all drains.
  drains.forEach(drain => {
    const color = statusColor(drain.status);

    const marker = L.circleMarker(
      [drain.latitude, drain.longitude],
      {
        radius: 9,
        color: color,
        fillColor: color,
        fillOpacity: 0.9,
        weight: 2
      }
    ).addTo(map);

    marker.bindPopup(createPopupContent(drain));

    markersById.set(drain.id, marker);
  });

  // Ensure the map renders at the correct size.
  setTimeout(() => {
    map.invalidateSize();
  }, 200);
}

// Start the dashboard after HTML has loaded.
document.addEventListener("DOMContentLoaded", () => {
  try {
    renderSummary();
    renderDrainCards();
    initDrainMap();
  } catch (error) {
    console.error(
      "Smart Drain Monitor initialization failed:",
      error
    );

    document.getElementById("updated").textContent =
      "Setup error. Open the browser Console for details.";
  }
});

