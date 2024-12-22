const AuthService = require("./AuthService");
const createError = require("http-errors");

class InitService {
  constructor(db) {
    this.db = db;
    this.authService = new AuthService(db);
    this.User = db.User;
    this.Artist = db.Artist;
    this.Tour = db.Tour;
    this.Show = db.Show;
    this.Category = db.Category;
    this.Product = db.Product;
    this.ShowInventory = db.ShowInventory;
    this.Adjustment = db.Adjustment;
    this.UserRoleTour = db.UserRoleTour;
  }

  // Add static data, random data, no adjustments ++?
  async init() {
    try {
      // Users
      const admin = await this.authService.hashPassword("P@ssword2023");
      const user = await this.authService.hashPassword("minlength");

      const users = await this.User.bulkCreate([
        {
          firstName: "Admin",
          lastName: "Support",
          email: "admin@noroff.no",
          phone: "911",
          encryptedPassword: admin.hashedPassword,
          salt: admin.salt,
          role: "admin",
        },
        {
          firstName: "John",
          lastName: "Doe",
          email: "johndoe@email.com",
          encryptedPassword: user.hashedPassword,
          salt: user.salt,
          role: "user",
        },
      ]);

      // Artists
      const artists = await this.Artist.bulkCreate([
        { name: "The Rolling Stones" },
        { name: "The Beatles" },
      ]);

      // Tours
      const tours = await this.Tour.bulkCreate([
        {
          name: "World Tour 2025",
          startDate: "2025-01-01",
          endDate: "2025-12-31",
          artistId: artists[0].id,
          createdBy: users[0].id,
        },
        {
          name: "Europe Tour 2025",
          startDate: "2025-06-01",
          endDate: "2025-08-31",
          artistId: artists[1].id,
          createdBy: users[0].id,
        },
      ]);

      // Add User Roles to Tours
      await this.UserRoleTour.bulkCreate([
        {
          userId: users[1].id,
          tourId: tours[0].id,
          role: "manager",
        },
        {
          userId: users[1].id,
          tourId: tours[1].id,
          role: "manager",
        },
      ]);

      // Shows
      const shows = await this.Show.bulkCreate([
        // World Tour 2025
        {
          date: "2025-01-15",
          venue: "Madison Square Garden",
          city: "New York",
          country: "USA",
          getInTime: "16:00",
          loadOutTime: "23:00",
          doorsTime: "18:30",
          onStageTime: "20:00",
          artistId: artists[0].id,
          tourId: tours[0].id,
        },
        {
          date: "2025-03-01",
          venue: "Staples Center",
          city: "Los Angeles",
          country: "USA",
          getInTime: "15:00",
          loadOutTime: "22:30",
          doorsTime: "18:00",
          onStageTime: "19:30",
          artistId: artists[0].id,
          tourId: tours[0].id,
        },
        {
          date: "2025-05-10",
          venue: "Wembley Stadium",
          city: "London",
          country: "UK",
          getInTime: "14:00",
          loadOutTime: "23:00",
          doorsTime: "17:30",
          onStageTime: "20:00",
          artistId: artists[0].id,
          tourId: tours[0].id,
        },

        // Europe Tour 2025
        {
          date: "2025-06-15",
          venue: "O2 Arena",
          city: "London",
          country: "UK",
          getInTime: "15:00",
          loadOutTime: "22:00",
          doorsTime: "19:00",
          onStageTime: "20:30",
          artistId: artists[1].id,
          tourId: tours[1].id,
        },
        {
          date: "2025-07-05",
          venue: "Olympiastadion",
          city: "Berlin",
          country: "Germany",
          getInTime: "14:30",
          loadOutTime: "22:30",
          doorsTime: "18:30",
          onStageTime: "20:00",
          artistId: artists[1].id,
          tourId: tours[1].id,
        },
        {
          date: "2025-08-20",
          venue: "Accor Arena",
          city: "Paris",
          country: "France",
          getInTime: "15:00",
          loadOutTime: "23:00",
          doorsTime: "18:00",
          onStageTime: "20:00",
          artistId: artists[1].id,
          tourId: tours[1].id,
        },
      ]);

      // Categories
      const categories = await this.Category.bulkCreate([
        { name: "T-Shirts" },
        { name: "Hoodies" },
        { name: "Accessories" },
      ]);

      // Products
      const products = await this.Product.bulkCreate([
        // The Rolling Stones products
        {
          name: "World Tour T-Shirt",
          description: "Official T-Shirt for the World Tour",
          color: "Black",
          size: "M",
          price: 25.99,
          categoryId: categories[0].id,
          artistId: artists[0].id,
        },
        {
          name: "World Tour Hoodie",
          description: "Official Hoodie for the World Tour",
          color: "Gray",
          size: "L",
          price: 49.99,
          categoryId: categories[1].id,
          artistId: artists[0].id,
        },
        {
          name: "World Tour Cap",
          description: "Official Cap for the World Tour",
          color: "Red",
          size: "One Size",
          price: 19.99,
          categoryId: categories[2].id,
          artistId: artists[0].id,
        },

        // The Beatles products
        {
          name: "Europe Tour T-Shirt",
          description: "Official T-Shirt for the Europe Tour",
          color: "White",
          size: "M",
          price: 24.99,
          categoryId: categories[0].id,
          artistId: artists[1].id,
        },
        {
          name: "Europe Tour Hoodie",
          description: "Limited Edition Hoodie for the Europe Tour",
          color: "Navy",
          size: "XL",
          price: 54.99,
          categoryId: categories[1].id,
          artistId: artists[1].id,
        },
        {
          name: "Europe Tour Mug",
          description: "Exclusive Mug for the Europe Tour",
          color: "Blue",
          size: "350ml",
          price: 14.99,
          categoryId: categories[2].id,
          artistId: artists[1].id,
        },
      ]);

      // Show Inventory
      const showInventories = [];

      // Populate show inventories
      shows.forEach((show) => {
        const artistProducts = products.filter(
          (product) => product.artistId === show.artistId
        );

        artistProducts.forEach((product) => {
          const startInventory = Math.floor(Math.random() * 200) + 50;
          const endInventory = Math.floor(Math.random() * (startInventory + 1));
          showInventories.push({
            showId: show.id,
            productId: product.id,
            startInventory,
            endInventory,
          });
        });
      });

      await this.ShowInventory.bulkCreate(showInventories);

      // Adjustments
      const adjustments = [];
      for (const inventory of showInventories) {
        const { showId, productId } = inventory;
        const showInventory = await this.ShowInventory.findOne({
          where: { showId, productId },
        });

        if (!showInventory) {
          console.error(
            `ShowInventory not found for showId ${showId} and productId ${productId}`
          );
          continue;
        }

        const randomAdjustments = Math.floor(Math.random() * 5) + 1;
        for (let i = 0; i < randomAdjustments; i++) {
          const type = ["giveaway", "discount", "loss", "restock"][
            Math.floor(Math.random() * 4)
          ];
          const quantity = Math.floor(Math.random() * 10) + 1;
          const reason = `${type} reason`;
          const userId = users[Math.floor(Math.random() * users.length)].id;

          let discountValue = null;
          let discountType = null;

          if (type === "discount") {
            discountValue = Math.random() < 0.5 ? 5 : 10;
            discountType = Math.random() < 0.5 ? "fixed" : "percentage";
          }

          adjustments.push({
            showInventoryId: showInventory.id,
            quantity,
            reason,
            type,
            discountValue,
            discountType,
            userId,
          });
        }
      }

      await this.Adjustment.bulkCreate(adjustments);

      return { message: "Data initialized successfully!" };
    } catch (err) {
      throw createError(500, "Error initializing data in database");
    }
  }
}

module.exports = InitService;
