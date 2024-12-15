const express = require("express");
const router = express.Router();
const db = require("../models");
const ArtistService = require("../services/ArtistService");
const artistService = new ArtistService(db);
const { isAuth } = require("../middleware/auth");
const {
  validateArtist,
  validateArtistSearch,
} = require("../middleware/validation");

router.use(isAuth);

// Get all artists
router.get("/", validateArtistSearch, async (req, res, next) => {
  try {
    const artists = await artistService.getAllByQuery(req.query);
    if (!artists.length) {
      return res.status(200).json({
        success: true,
        message: Object.keys(req.query).length
          ? `No artists found matching the name: ${req.query.name}`
          : "No artists exist",
        data: artists,
      });
    }
    return res.status(200).json({ success: true, data: artists });
  } catch (err) {
    next(err);
  }
});

// Get artist by id
router.get("/:artistId", async (req, res, next) => {
  try {
    const { artistId } = req.params;
    const artist = await artistService.getById(artistId);
    return res.status(200).json({ success: true, data: artist });
  } catch (err) {
    next(err);
  }
});

// Create new artist
router.post("/", validateArtist, async (req, res, next) => {
  try {
    const newArtist = await artistService.create(req.body);
    return res.status(201).json({
      success: true,
      message: "Artist created successfully",
      data: newArtist,
    });
  } catch (err) {
    next(err);
  }
});

// Update artist
router.put("/:artistId", validateArtist, async (req, res, next) => {
  try {
    const { artistId } = req.params;
    const updatedArtist = await artistService.update(artistId, req.body);
    if (updatedArtist.noChanges) {
      return res.status(200).json({
        success: true,
        message: "No changes made to artist",
        data: updatedArtist.data,
      });
    }
    return res.status(200).json({
      success: true,
      message: "Artist updated successfully",
      data: updatedArtist,
    });
  } catch (err) {
    next(err);
  }
});

// Delete artist by id
router.delete("/:artistId", async (req, res, next) => {
  try {
    const { artistId } = req.params;
    const artist = await artistService.delete(artistId);
    return res.status(200).json({
      success: true,
      message: "Artist deleted successfully",
      data: artist,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
