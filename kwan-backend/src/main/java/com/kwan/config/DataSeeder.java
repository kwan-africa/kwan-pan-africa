package com.kwan.config;

import com.kwan.model.Listing;
import com.kwan.model.Operator;
import com.kwan.repository.ListingRepository;
import com.kwan.repository.OperatorRepository;
import com.kwan.service.EmbeddingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;

@Configuration
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final OperatorRepository operatorRepository;
    private final ListingRepository listingRepository;
    private final EmbeddingService embeddingService;

    public DataSeeder(OperatorRepository operatorRepository, ListingRepository listingRepository, EmbeddingService embeddingService) {
        this.operatorRepository = operatorRepository;
        this.listingRepository = listingRepository;
        this.embeddingService = embeddingService;
    }

    @Override
    public void run(String... args) {
        try {
            if (operatorRepository.count() >= 10) {
                log.info("Database already seeded with {} operators.", operatorRepository.count());
                return;
            }
        } catch (Exception e) {
            log.info("Starting fresh database seeding...");
        }

        log.info("Seeding database with 10 authentic Pan-African grassroots operators across GH, NG, RW, KE, and SN...");

        try {
            // 1. Jamestown Heritage Walking Tours (Accra, Ghana)
            Operator op1 = operatorRepository.save(Operator.builder()
                    .businessName("Jamestown Heritage Walking Tours")
                    .email("nii.jamestown@gmail.com")
                    .whatsappNumber("+233241112233")
                    .instagramHandle("@jamestown_tours_accra")
                    .country("GH").city("Accra")
                    .description("Grassroots youth-led walking tours through historic Jamestown lighthouse, boxing gyms, and fish markets.")
                    .momoWalletNumber("0241112233").momoProvider("MTN")
                    .isVerified(true)
                    .build());

            createAndEmbedListing(op1,
                    "Historic Jamestown & Ga Boxing Culture Walk",
                    "Explore the vibrant fishing port of Jamestown, climb the 1930s lighthouse, visit grassroots boxing academies where world champions trained, and taste fresh smoked tilapia at the harbour.",
                    Listing.ListingCategory.CULTURAL_EXPERIENCE,
                    BigDecimal.valueOf(120), "GHS", "Accra", "Jamestown Lighthouse Environs",
                    3, 8, new String[]{"history", "culture", "boxing", "street food", "ga", "accra"},
                    "https://wa.me/233241112233");

            createAndEmbedListing(op1,
                    "Makola Market Street Food & Textile Trail",
                    "Guided navigation through Makola's bustling lanes. Learn to bargain in Twi ('Te so kakra!'), try authentic Waakye with shito, and select custom batik fabrics directly from women vendors.",
                    Listing.ListingCategory.STREET_VENDOR,
                    BigDecimal.valueOf(90), "GHS", "Accra", "Makola Market Central Gate",
                    2, 6, new String[]{"market", "waakye", "street food", "batik", "twi", "accra"},
                    "https://wa.me/233241112233");

            // 2. Volta Estuary Eco-Homestay (Ada Foah, Ghana)
            Operator op2 = operatorRepository.save(Operator.builder()
                    .businessName("Volta Estuary Eco-Homestay")
                    .email("ama.volta.eco@gmail.com")
                    .whatsappNumber("+233208889900")
                    .instagramHandle("@volta_estuary_homestay")
                    .country("GH").city("Ada Foah")
                    .description("Family-run palm-thatched guesthouse right where the Volta River meets the Atlantic Ocean.")
                    .momoWalletNumber("0208889900").momoProvider("TELECEL")
                    .isVerified(true)
                    .build());

            createAndEmbedListing(op2,
                    "Riverfront Bamboo Bungalow & Dugout Canoe Trip",
                    "Overnight stay in an eco bungalow surrounded by mangroves. Includes traditional morning canoe trip with local fishermen and fresh clam barbecue at sunset.",
                    Listing.ListingCategory.ACCOMMODATION,
                    BigDecimal.valueOf(380), "GHS", "Ada Foah", "Volta River Estuary Island",
                    24, 4, new String[]{"accommodation", "homestay", "river", "eco", "nature", "canoe"},
                    "https://wa.me/233208889900");

            // 3. Circle Trotro Navigator Guides (Accra, Ghana)
            Operator op3 = operatorRepository.save(Operator.builder()
                    .businessName("Circle Trotro Navigator Guides")
                    .email("kwame.trotro@gmail.com")
                    .whatsappNumber("+233549990011")
                    .instagramHandle("@accra_trotro_guide")
                    .country("GH").city("Accra")
                    .description("Local transit navigators helping visitors navigate trotro stations (Circle, 37, Kaneshie) with confidence.")
                    .momoWalletNumber("0549990011").momoProvider("MTN")
                    .isVerified(true)
                    .build());

            createAndEmbedListing(op3,
                    "Trotro Navigation & Commuter Experience",
                    "Ride trotros like a local with an experienced guide. Learn hand signals for routes, driver etiquette, and hop between Circle, Osu, and Cape Coast station hubs safely.",
                    Listing.ListingCategory.TRANSPORT,
                    BigDecimal.valueOf(60), "GHS", "Accra", "Circle Kwame Nkrumah Interchange",
                    2, 4, new String[]{"transport", "trotro", "transit", "local experience", "accra"},
                    "https://wa.me/233549990011");

            // 4. Cape Coast Ancestral Castle & Kakum Guide (Cape Coast, Ghana)
            Operator op4 = operatorRepository.save(Operator.builder()
                    .businessName("Cape Coast Ancestral Heritage Guides")
                    .email("kofi.capecoast@gmail.com")
                    .whatsappNumber("+233243334455")
                    .instagramHandle("@capecoast_heritage")
                    .country("GH").city("Cape Coast")
                    .description("Independent Fante guides conducting reflective tours of Cape Coast Castle dungeons and rainforest canopy walks.")
                    .momoWalletNumber("0243334455").momoProvider("MTN")
                    .isVerified(true)
                    .build());

            createAndEmbedListing(op4,
                    "Cape Coast Castle Dungeons & Kakum Rainforest Canopy Walk",
                    "Deep historic tour through Cape Coast Castle, Door of No Return, followed by Kakum National Park rainforest canopy walkway experience.",
                    Listing.ListingCategory.CULTURAL_EXPERIENCE,
                    BigDecimal.valueOf(280), "GHS", "Cape Coast", "Cape Coast Castle Gate",
                    6, 10, new String[]{"history", "dungeons", "heritage", "rainforest", "canopy", "cape coast"},
                    "https://wa.me/233243334455");

            // 5. Eko Street Food & Sound Tours (Lagos, Nigeria)
            Operator op5 = operatorRepository.save(Operator.builder()
                    .businessName("Eko Street Food & Sound Tours")
                    .email("tunde.lagos@gmail.com")
                    .whatsappNumber("+2348033334444")
                    .instagramHandle("@eko_street_tours")
                    .country("NG").city("Lagos")
                    .description("Independent Lagos guides taking foodies and music lovers behind the scenes of Surulere and Fela's Shrine.")
                    .momoWalletNumber("08033334444").momoProvider("MTN")
                    .isVerified(true)
                    .build());

            createAndEmbedListing(op5,
                    "Suya, Jollof & New Afrika Shrine Night Experience",
                    "Authentic night tour starting at Glover Court Suya spot, exploring local Buka joints for spicy Amala and Pepper Soup, ending with live Afrobeat at the Shrine.",
                    Listing.ListingCategory.FOOD_EXPERIENCE,
                    BigDecimal.valueOf(25000), "NGN", "Lagos", "Ikeja & Surulere",
                    4, 10, new String[]{"food", "suya", "jollof", "afrobeat", "shrine", "nightlife", "lagos"},
                    "https://wa.me/2348033334444");

            // 6. Lekki Conservation & Craft Market Guides (Lagos, Nigeria)
            Operator op6 = operatorRepository.save(Operator.builder()
                    .businessName("Lekki Eco & Art Collective")
                    .email("chioma.lekki@gmail.com")
                    .whatsappNumber("+2348055556666")
                    .instagramHandle("@lekki_craft_tours")
                    .country("NG").city("Lagos")
                    .description("Lagos artisan collective guiding visitors through Lekki Conservation canopy bridge and Jakande Art Market.")
                    .momoWalletNumber("08055556666").momoProvider("MTN")
                    .isVerified(true)
                    .build());

            createAndEmbedListing(op6,
                    "Lekki Canopy Walkway & Jakande African Craft Market",
                    "Walk Africa's longest canopy bridge over mangrove wetlands, followed by personalized woodcarving & bronze shopping at Jakande craft market.",
                    Listing.ListingCategory.CULTURAL_EXPERIENCE,
                    BigDecimal.valueOf(18000), "NGN", "Lagos", "Lekki Peninsula",
                    4, 8, new String[]{"nature", "canopy", "art", "crafts", "market", "lagos"},
                    "https://wa.me/2348055556666");

            // 7. Kimironko Craft & Coffee Guides (Kigali, Rwanda)
            Operator op7 = operatorRepository.save(Operator.builder()
                    .businessName("Kimironko Craft & Coffee Guides")
                    .email("jean.kigali@gmail.com")
                    .whatsappNumber("+250788112233")
                    .instagramHandle("@kigali_grassroots_tours")
                    .country("RW").city("Kigali")
                    .description("Local Kigali women artisans showing travelers traditional Imigongo art and specialty coffee roasting.")
                    .momoWalletNumber("0788112233").momoProvider("MTN")
                    .isVerified(true)
                    .build());

            createAndEmbedListing(op7,
                    "Kimironko Market & Specialty Coffee Workshop",
                    "Walk through Kigali's largest market, learn custom Agaseke basket weaving from women cooperatives, and roast local bourbon coffee beans over open charcoal.",
                    Listing.ListingCategory.CULTURAL_EXPERIENCE,
                    BigDecimal.valueOf(25000), "RWF", "Kigali", "Kimironko Market",
                    3, 6, new String[]{"market", "coffee", "crafts", "weaving", "kigali", "rwanda"},
                    "https://wa.me/250788112233");

            // 8. Musanze Gorilla Footsteps Eco Lodge (Musanze, Rwanda)
            Operator op8 = operatorRepository.save(Operator.builder()
                    .businessName("Volcanoes Eco Guesthouse")
                    .email("keza.musanze@gmail.com")
                    .whatsappNumber("+250789990011")
                    .instagramHandle("@musanze_eco_lodge")
                    .country("RW").city("Musanze")
                    .description("Community-owned lodge near Volcanoes National Park offering farm-to-table Rwandan cuisine and cultural storytelling.")
                    .momoWalletNumber("0789990011").momoProvider("MTN")
                    .isVerified(true)
                    .build());

            createAndEmbedListing(op8,
                    "Volcanoes Eco Lodge Room & Cultural Storytelling",
                    "Overnight room at the foot of Mount Karisimbi. Includes organic Rwandan dinner, Intore dance performance, and morning tea plantation walk.",
                    Listing.ListingCategory.ACCOMMODATION,
                    BigDecimal.valueOf(65000), "RWF", "Musanze", "Kinigi Village Environs",
                    24, 2, new String[]{"accommodation", "volcanoes", "eco", "mountains", "rwanda"},
                    "https://wa.me/250789990011");

            // 9. Kibera Youth Empowerment Tours (Nairobi, Kenya)
            Operator op9 = operatorRepository.save(Operator.builder()
                    .businessName("Nairobi Grassroots Youth Guides")
                    .email("otieno.nairobi@gmail.com")
                    .whatsappNumber("+254712345678")
                    .instagramHandle("@nairobi_grassroots")
                    .country("KE").city("Nairobi")
                    .description("Youth-led social impact tours through Kibera's bone-craft workshops, Matatu culture, and local food Bomas.")
                    .momoWalletNumber("0712345678").momoProvider("MPESA")
                    .isVerified(true)
                    .build());

            createAndEmbedListing(op9,
                    "Nairobi Matatu Sound Culture & Kibera Artisan Workshop",
                    "Experience Nairobi's famous pimped Matatu buses, visit artisan workshops turning recycled bone into jewelry, and taste Nyama Choma with Ugali.",
                    Listing.ListingCategory.CULTURAL_EXPERIENCE,
                    BigDecimal.valueOf(3500), "KES", "Nairobi", "Kibera & Central Station",
                    3, 6, new String[]{"matatu", "transit", "artisan", "nyama choma", "nairobi", "kenya"},
                    "https://wa.me/254712345678");

            // 10. Gorée Island Artists & Griot Storytellers (Dakar, Senegal)
            Operator op10 = operatorRepository.save(Operator.builder()
                    .businessName("Dakar Griot & Sand Art Collective")
                    .email("moussa.dakar@gmail.com")
                    .whatsappNumber("+221771112233")
                    .instagramHandle("@dakar_goree_tours")
                    .country("SN").city("Dakar")
                    .description("Senegalese Griot storytellers and sand artists providing cultural journeys through Gorée Island and Marché HLM.")
                    .momoWalletNumber("0771112233").momoProvider("MTN")
                    .isVerified(true)
                    .build());

            createAndEmbedListing(op10,
                    "Gorée Island House of Slaves & Sand Painting Workshop",
                    "Ferry crossing from Dakar to historic Île de Gorée, guided walkthrough of Maison des Esclaves, and hands-on sand art creation with Wolof master artists.",
                    Listing.ListingCategory.CULTURAL_EXPERIENCE,
                    BigDecimal.valueOf(20000), "XOF", "Dakar", "Île de Gorée Harbor",
                    4, 8, new String[]{"history", "goree", "sand art", "griot", "dakar", "senegal"},
                    "https://wa.me/221771112233");

            log.info("Successfully seeded 10 authentic Pan-African operators with Gemini vector embeddings!");

        } catch (Exception e) {
            log.error("Failed to seed database: {}", e.getMessage(), e);
        }
    }

    private void createAndEmbedListing(
            Operator operator, String title, String description,
            Listing.ListingCategory category, BigDecimal priceAmount, String currency,
            String city, String locationDetails, int durationHours, int maxGroupSize,
            String[] tags, String whatsappLink) {

        try {
            Listing listing = Listing.builder()
                    .operator(operator)
                    .title(title)
                    .description(description)
                    .category(category)
                    .priceAmount(priceAmount)
                    .priceCurrency(currency)
                    .country(operator.getCountry())
                    .city(city)
                    .locationDetails(locationDetails)
                    .durationHours(durationHours)
                    .maxGroupSize(maxGroupSize)
                    .tags(tags)
                    .whatsappBookingLink(whatsappLink)
                    .isActive(true)
                    .build();

            String textToEmbed = String.format("%s %s %s %s", title, description, city, category.name());
            try {
                float[] embedding = embeddingService.embed(textToEmbed);
                listing.setEmbedding(embedding);
            } catch (Exception e) {
                log.warn("Could not generate vector embedding for '{}' during seed: {}", title, e.getMessage());
            }

            listingRepository.save(listing);
            log.info("  ✓ Seeded: {} ({})", title, city);
        } catch (Exception e) {
            log.error("Error creating listing '{}': {}", title, e.getMessage());
        }
    }
}
