import React, { useState, useEffect, useMemo, useRef } from "react";
import { useLoadScript } from "@react-google-maps/api";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from "@reach/combobox";
import "@reach/combobox/styles.css";
import { createTheme, ThemeProvider } from "@material-ui/core/styles";
import { IconButton } from "@material-ui/core";
import CloseIcon from '@material-ui/icons/Close';
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

export default function Places() {
  const libraries = useMemo(() => ["places"], []);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: 'AIzaSyBkN1LKjBkqmtz-8Pz-kCkG_lBM6Hm7y_0', // Replace with your actual API key
    libraries,
  });

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <ThemeProvider theme={theme}>
      <Map isLoaded={isLoaded} />
    </ThemeProvider>
  );
}

function Map({ isLoaded }) {
  const center = useMemo(() => ({ lat: 51, lng: 17 }), []);
  const [selected, setSelected] = useState(null);
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);

  useEffect(() => {
    if (isLoaded && mapContainerRef.current && !mapRef.current) {
      // Initialize map only once
      mapRef.current = new window.google.maps.Map(mapContainerRef.current, {
        center: center,
        zoom: 10,
      });
    }

    if (selected && mapRef.current) {
      new window.google.maps.Marker({
        map: mapRef.current,
        position: selected,
      });

      mapRef.current.setCenter(selected);
    }
  }, [isLoaded, selected, center]);

  return (
    <>
      <div className="places-container">
        <PlacesAutocomplete setSelected={setSelected} />
      </div>
      {/* Assigning mapContainerRef to the map div */}
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

  const handleClear = () => {
    setValue('');
    setSelected(null);
    clearSuggestions();
  };

  return (
    <div className="search-box">
      <Combobox onSelect={handleSelect}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <ComboboxInput
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={!ready}
            className="combobox-input"
            placeholder="Search an address"
          />
          {value && (
            <IconButton onClick={handleClear} aria-label="clear search">
              <CloseIcon />
            </IconButton>
          )}
        </div>
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
