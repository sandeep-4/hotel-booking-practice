import React, { Component } from "react";

import { useState, useEffect } from "react";
import queryString from "query-string";
import { Link } from "react-router-dom";
import Search from "../components/forms/Search";
import { searchListings } from "../actions/hotel";
import SmallCard from "../components/cards/SmallCard";

const SearchResult = () => {
  const [searchLocation, setLocation] = useState("");
  const [searchData, setSearchData] = useState("");
  const [searchBed, setSearchBed] = useState("");
  const [hotels, setHotels] = useState([]);

  useEffect(() => {
    const { loaction, date, bed } = queryString.parse(window.location.search);
    searchListings({ loaction, date, bed }).then((res) => {
      setHotels(res.data);
    });
  }, [window.location.href]);

  return (
    <>
      <div className="col">
        <br />
        <Search />
      </div>
      <div className="container">
        <div className="row">
          {hotels.map((h) => (
            <SmallCard key={h._id} h={h} />
          ))}
        </div>
      </div>
    </>
  );
};

export default SearchResult;
