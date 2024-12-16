import React, { useState, useEffect, useMemo, useRef } from "react";
import { useLoadScript } from "@react-google-maps/api";
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete";
import { useLocation } from "react-router-dom";
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from "@reach/combobox";
import "@reach/combobox/styles.css";
import { createTheme, ThemeProvider } from "@material-ui/core/styles";
import "./Map.css";

const theme = createTheme({
  palette: {
    primary: {
      main: "#556cd6",
    },
    secondary: {
      main: "#19857b",
    },
  },
});

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function Places() {
  const libraries = useMemo(() => ["places"], []);
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY, 
    libraries,
  });

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <ThemeProvider theme={theme}>
      <div className="map-wrapper">
        <Map isLoaded={isLoaded} />
      </div>
    </ThemeProvider>
  );
}

function Map({ isLoaded }) {
  const center = useMemo(() => ({ lat: 51, lng: 17 }), []);
  const [selected, setSelected] = useState(null);
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const query = useQuery();
  const address = query.get("address");

  useEffect(() => {
    if (isLoaded && mapContainerRef.current && !mapRef.current) {
      mapRef.current = new window.google.maps.Map(mapContainerRef.current, {
        center: center,
        zoom: 10,
      });
    }

    if (address) {
      handleAddressSearch(address);
    }
  }, [isLoaded, address]);

  const handleAddressSearch = async (address) => {
    try {
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);
      const position = { lat, lng };
      setSelected(position);
      if (mapRef.current) {
        new window.google.maps.Marker({
          map: mapRef.current,
          position,
        });
        mapRef.current.setCenter(position);
      }
    } catch (error) {
      console.error("Error getting geocode for the selected address:", error);
    }
  };

  return (
    <>
      <div className="places-container">
        <PlacesAutocomplete setSelected={setSelected} />
      </div>
      <div ref={mapContainerRef} className="map-container"></div>
    </>
  );
}

const PlacesAutocomplete = ({ setSelected }) => {
  const {
    ready,
    value,
    setValue,
    suggestions: { status, data },
    clearSuggestions,
  } = usePlacesAutocomplete();

  const handleSelect = async (address) => {
    setValue(address, false);
    clearSuggestions();

    try {
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);
      setSelected({ lat, lng });
    } catch (error) {
      console.error("Error getting geocode for the selected address:", error);
    }
  };

  return (
    <div className="search-box">
      <Combobox onSelect={handleSelect}>
        <ComboboxInput
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={!ready}
          className="combobox-input"
          placeholder="Search an address"
        />
        <ComboboxPopover>
          <ComboboxList>
            {status === "OK" &&
              data.map(({ place_id, description }) => (
                <ComboboxOption key={place_id} value={description} />
              ))}
          </ComboboxList>
        </ComboboxPopover>
      </Combobox>
    </div>
  );
};
