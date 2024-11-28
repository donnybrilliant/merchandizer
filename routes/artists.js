const express = require("express");
const router = express.Router();
const db = require("../models");
const ArtistService = require("../services/ArtistService");
const artistService = new ArtistService(db);
const { validateArtist } = require("../middleware/validation");

// Get all artists
router.get("/", async (req, res, next) => {
  try {
    const artists = await artistService.getAll();
    if (!artists.length) {
      return res
        .status(200)
        .json({ success: true, message: "No artists exist", data: artists });
    }
    return res.status(200).json({ success: true, data: artists });
  } catch (err) {
    next(err);
  }
});

// Get artist(s) by name
router.get("/search", validateArtist, async (req, res, next) => {
  try {
    const artists = await artistService.search(req.query.name);

    if (!artists.length) {
      return res.status(404).json({
        success: false,
        error: "No artists found matching the query",
      });
    }

    return res.status(200).json({
      success: true,
      data: artists,
    });
  } catch (err) {
    next(err);
  }
});

// Get artist by id
router.get("/:id", async (req, res, next) => {
  try {
    const artist = await artistService.getById(req.params.id);
    if (!artist) {
      return res
        .status(404)
        .json({ success: false, error: "Artist not found" });
    }
    return res.status(200).json({ success: true, data: artist });
  } catch (err) {
    next(err);
  }
});

// Create new artist
router.post("/", validateArtist, async (req, res, next) => {
  try {
    const artist = await artistService.create(req.body);
    return res.status(201).json({ success: true, data: artist });
  } catch (err) {
    next(err);
  }
});

// Delete artist by id
router.delete("/:id", async (req, res, next) => {
  try {
    const deleted = await artistService.delete(req.params.id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, error: "Artist not found" });
    }
    return res
      .status(200)
      .json({ success: true, message: "Artist deleted successfully" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
