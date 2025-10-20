import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosPrivate from "../../utils/axios/axiosPrivate";
import axiosPublic from "../../utils/axios/axiosPublic";
import {
  CREATE_AMENITY_API,
  GET_AMENITIES_API,
  GET_AMENITY_BY_ID_API,
  UPDATE_AMENITY_API,
  DELETE_AMENITY_API,
  TOGGLE_AMENITY_STATUS_API,
  GET_AMENITIES_BY_SPORT_TYPE_API,
  GET_AMENITIES_BY_TYPE_API,
} from "./amenitiesAPI";
import type {
  Amenity,
  AmenitiesResponse,
  CreateAmenityRequest,
  UpdateAmenityRequest,
  AmenitiesQueryParams,
  ErrorResponse,
} from "../../types/amenities-type";

// Create amenity
export const createAmenity = createAsyncThunk<
  Amenity,
  CreateAmenityRequest,
  { rejectValue: ErrorResponse }
>("amenities/createAmenity", async (amenityData, thunkAPI) => {
  try {
    const formData = new FormData();
    formData.append("name", amenityData.name);
    formData.append("sportType", amenityData.sportType);
    formData.append("type", amenityData.type);
    
    if (amenityData.description) formData.append("description", amenityData.description);
    if (amenityData.isActive !== undefined) formData.append("isActive", amenityData.isActive.toString());
    if (amenityData.imageUrl) formData.append("imageUrl", amenityData.imageUrl);
    if (amenityData.image) formData.append("image", amenityData.image);

    const response = await axiosPrivate.post(CREATE_AMENITY_API, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue({
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || error.message || "Failed to create amenity",
      error: error.response?.data?.error || "Internal Server Error",
    });
  }
});

// Get amenities with pagination and filters
export const getAmenities = createAsyncThunk<
  AmenitiesResponse,
  AmenitiesQueryParams,
  { rejectValue: ErrorResponse }
>("amenities/getAmenities", async (params, thunkAPI) => {
  try {
    const response = await axiosPublic.get(GET_AMENITIES_API, { params });
    return response.data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue({
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || error.message || "Failed to fetch amenities",
      error: error.response?.data?.error || "Internal Server Error",
    });
  }
});

// Get amenity by ID
export const getAmenityById = createAsyncThunk<
  Amenity,
  string,
  { rejectValue: ErrorResponse }
>("amenities/getAmenityById", async (id, thunkAPI) => {
  try {
    const response = await axiosPublic.get(GET_AMENITY_BY_ID_API(id));
    return response.data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue({
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || error.message || "Failed to fetch amenity",
      error: error.response?.data?.error || "Internal Server Error",
    });
  }
});

// Update amenity
export const updateAmenity = createAsyncThunk<
  Amenity,
  { id: string; data: UpdateAmenityRequest },
  { rejectValue: ErrorResponse }
>("amenities/updateAmenity", async ({ id, data }, thunkAPI) => {
  try {
    const formData = new FormData();
    
    if (data.name) formData.append("name", data.name);
    if (data.description) formData.append("description", data.description);
    if (data.sportType) formData.append("sportType", data.sportType);
    if (data.isActive !== undefined) formData.append("isActive", data.isActive.toString());
    if (data.imageUrl) formData.append("imageUrl", data.imageUrl);
    if (data.type) formData.append("type", data.type);
    if (data.image) formData.append("image", data.image);

    const response = await axiosPrivate.patch(UPDATE_AMENITY_API(id), formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue({
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || error.message || "Failed to update amenity",
      error: error.response?.data?.error || "Internal Server Error",
    });
  }
});

// Delete amenity
export const deleteAmenity = createAsyncThunk<
  { message: string },
  string,
  { rejectValue: ErrorResponse }
>("amenities/deleteAmenity", async (id, thunkAPI) => {
  try {
    const response = await axiosPrivate.delete(DELETE_AMENITY_API(id));
    return response.data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue({
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || error.message || "Failed to delete amenity",
      error: error.response?.data?.error || "Internal Server Error",
    });
  }
});

// Toggle amenity status
export const toggleAmenityStatus = createAsyncThunk<
  Amenity,
  string,
  { rejectValue: ErrorResponse }
>("amenities/toggleAmenityStatus", async (id, thunkAPI) => {
  try {
    const response = await axiosPrivate.patch(TOGGLE_AMENITY_STATUS_API(id));
    return response.data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue({
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || error.message || "Failed to toggle amenity status",
      error: error.response?.data?.error || "Internal Server Error",
    });
  }
});

// Get amenities by sport type
export const getAmenitiesBySportType = createAsyncThunk<
  Amenity[],
  string,
  { rejectValue: ErrorResponse }
>("amenities/getAmenitiesBySportType", async (sportType, thunkAPI) => {
  try {
    const response = await axiosPublic.get(GET_AMENITIES_BY_SPORT_TYPE_API(sportType));
    return response.data; // API trả về array trực tiếp theo documentation
  } catch (error: any) {
    return thunkAPI.rejectWithValue({
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || error.message || "Failed to fetch amenities by sport type",
      error: error.response?.data?.error || "Internal Server Error",
    });
  }
});

// Get amenities by type
export const getAmenitiesByType = createAsyncThunk<
  Amenity[],
  string,
  { rejectValue: ErrorResponse }
>("amenities/getAmenitiesByType", async (type, thunkAPI) => {
  try {
    const response = await axiosPublic.get(GET_AMENITIES_BY_TYPE_API(type));
    return response.data; // API trả về array trực tiếp theo documentation
  } catch (error: any) {
    return thunkAPI.rejectWithValue({
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || error.message || "Failed to fetch amenities by type",
      error: error.response?.data?.error || "Internal Server Error",
    });
  }
});

// Get amenities by type and sport type (combined filter)
export const getAmenitiesByTypeAndSport = createAsyncThunk<
  Amenity[],
  { type: string; sportType: string },
  { rejectValue: ErrorResponse }
>("amenities/getAmenitiesByTypeAndSport", async ({ type, sportType }, thunkAPI) => {
  try {
    // Sử dụng API getAmenities với query parameters để filter theo cả type và sportType
    const response = await axiosPublic.get(GET_AMENITIES_API, {
      params: { type, sportType, isActive: true }
    });
    return response.data.data; // Trả về data array từ pagination response
  } catch (error: any) {
    return thunkAPI.rejectWithValue({
      statusCode: error.response?.status || 500,
      message: error.response?.data?.message || error.message || "Failed to fetch amenities by type and sport",
      error: error.response?.data?.error || "Internal Server Error",
    });
  }
});
