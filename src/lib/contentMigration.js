import { db } from './supabase';

/**
 * Content Migration Utilities
 * Provides functions to migrate from Strapi to Supabase-based content management
 */

// Migration helper to create website content from Strapi data
export const migrateFromStrapi = async () => {
  console.log('Starting Strapi to Supabase migration...');
  
  try {
    // Migrate Hero Section
    await migrateHeroSection();
    
    // Migrate Testimonials
    await migrateTestimonials();
    
    // Migrate Programs
    await migratePrograms();
    
    // Migrate About Us
    await migrateAboutUs();
    
    console.log('Migration completed successfully!');
    return { success: true, message: 'All content migrated successfully' };
  } catch (error) {
    console.error('Migration failed:', error);
    return { success: false, error: error.message };
  }
};

// Migrate Hero Section from Strapi to Supabase
const migrateHeroSection = async () => {
  try {
    // Fetch from Strapi
    const response = await fetch('https://natural-melody-8463e9c17b.strapiapp.com/api/Hero?populate=*', {
      method: 'GET',
      headers: {
        'Authorization': `BEARER ${import.meta.env.VITE_APP_STRAPI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) throw new Error('Failed to fetch hero data from Strapi');
    
    const strapiData = await response.json();
    const hero = strapiData.data;
    
    // Check if hero content already exists in Supabase
    const { data: existingHero } = await db.getWebsiteSingleContent('hero');
    
    const heroFields = {
      heading: {
        type: 'text',
        value: hero.Heading || 'Welcome to Flores Dog Training'
      },
      subheading: {
        type: 'text',
        value: hero.Subheading || 'Professional dog training services'
      },
      heading_color: {
        type: 'color',
        value: hero.HeadingColor || '#ffffff'
      },
      subheading_color: {
        type: 'color',
        value: hero.SubheadingColor || '#ffffff'
      },
      background_image: {
        type: 'image',
        value: hero.Background?.formats?.large?.url || hero.Background?.url || ''
      }
    };
    
    if (existingHero && existingHero.length > 0) {
      // Update existing hero
      await db.updateWebsiteContentWithFields(
        existingHero[0].id,
        { title: 'Hero Section' },
        heroFields
      );
      console.log('Hero section updated');
    } else {
      // Create new hero content
      const { data: sections } = await db.getWebsiteSections();
      const heroSection = sections.find(s => s.section_key === 'hero');
      
      if (heroSection) {
        await db.createWebsiteContentWithFields({
          section_id: heroSection.id,
          title: 'Hero Section',
          status: 'published',
          sort_order: 0
        }, heroFields);
        console.log('Hero section created');
      }
    }
  } catch (error) {
    console.error('Hero migration failed:', error);
    throw error;
  }
};

// Migrate Testimonials from Strapi to Supabase
const migrateTestimonials = async () => {
  try {
    const response = await fetch('https://natural-melody-8463e9c17b.strapiapp.com/api/testimonials?populate=*', {
      method: 'GET',
      headers: {
        'Authorization': `BEARER ${import.meta.env.VITE_APP_STRAPI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) throw new Error('Failed to fetch testimonials from Strapi');
    
    const strapiData = await response.json();
    const testimonials = strapiData.data;
    
    const { data: sections } = await db.getWebsiteSections();
    const testimonialsSection = sections.find(s => s.section_key === 'testimonials');
    
    if (!testimonialsSection) {
      throw new Error('Testimonials section not found');
    }
    
    // Clear existing testimonials
    const { data: existingTestimonials } = await db.getWebsiteContentWithFields(testimonialsSection.id);
    for (const testimonial of existingTestimonials || []) {
      await db.deleteWebsiteContent(testimonial.id);
    }
    
    // Create new testimonials
    for (const testimonial of testimonials) {
      const fields = {
        client_name: {
          type: 'text',
          value: testimonial.ClientName || ''
        },
        testimonial_text: {
          type: 'rich_text',
          value: testimonial.TestimonialText || ''
        },
        photo: {
          type: 'image',
          value: testimonial.Photo?.url || ''
        },
        rating: {
          type: 'number',
          value: testimonial.Rating?.toString() || '5'
        }
      };
      
      await db.createWebsiteContentWithFields({
        section_id: testimonialsSection.id,
        title: testimonial.ClientName || 'Testimonial',
        status: 'published',
        sort_order: testimonial.Order || 0
      }, fields);
    }
    
    console.log(`Migrated ${testimonials.length} testimonials`);
  } catch (error) {
    console.error('Testimonials migration failed:', error);
    throw error;
  }
};

// Migrate Programs from Strapi to Supabase  
const migratePrograms = async () => {
  try {
    const response = await fetch('https://natural-melody-8463e9c17b.strapiapp.com/api/programs', {
      method: 'GET',
      headers: {
        'Authorization': `BEARER ${import.meta.env.VITE_APP_STRAPI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) throw new Error('Failed to fetch programs from Strapi');
    
    const strapiData = await response.json();
    const programs = strapiData.data;
    
    const { data: sections } = await db.getWebsiteSections();
    const programsSection = sections.find(s => s.section_key === 'programs');
    
    if (!programsSection) {
      throw new Error('Programs section not found');
    }
    
    // Clear existing programs
    const { data: existingPrograms } = await db.getWebsiteContentWithFields(programsSection.id);
    for (const program of existingPrograms || []) {
      await db.deleteWebsiteContent(program.id);
    }
    
    // Create new programs
    for (const [index, program] of programs.entries()) {
      const fields = {
        program_title: {
          type: 'text',
          value: program.Title || ''
        },
        description: {
          type: 'rich_text',
          value: program.Content ? JSON.stringify(program.Content) : ''
        },
        color: {
          type: 'color',
          value: program.Color || '#3B82F6'
        },
        price: {
          type: 'text',
          value: program.Price || ''
        },
        duration: {
          type: 'text',
          value: program.Duration || ''
        }
      };
      
      await db.createWebsiteContentWithFields({
        section_id: programsSection.id,
        title: program.Title || `Program ${index + 1}`,
        status: 'published',
        sort_order: index
      }, fields);
    }
    
    console.log(`Migrated ${programs.length} programs`);
  } catch (error) {
    console.error('Programs migration failed:', error);
    throw error;
  }
};

// Migrate About Us from Strapi to Supabase
const migrateAboutUs = async () => {
  try {
    const response = await fetch('https://natural-melody-8463e9c17b.strapiapp.com/api/About-Us?populate=*', {
      method: 'GET',
      headers: {
        'Authorization': `BEARER ${import.meta.env.VITE_APP_STRAPI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) throw new Error('Failed to fetch About Us from Strapi');
    
    const strapiData = await response.json();
    const aboutUs = strapiData.data;
    
    const { data: sections } = await db.getWebsiteSections();
    const aboutSection = sections.find(s => s.section_key === 'about_us');
    
    if (!aboutSection) {
      throw new Error('About Us section not found');
    }
    
    // Check if about us content already exists
    const { data: existingAbout } = await db.getWebsiteSingleContent('about_us');
    
    const aboutFields = {
      content: {
        type: 'rich_text',
        value: aboutUs.Content ? JSON.stringify(aboutUs.Content) : ''
      },
      image: {
        type: 'image',
        value: aboutUs.Image?.url || ''
      }
    };
    
    if (existingAbout && existingAbout.length > 0) {
      // Update existing about us
      await db.updateWebsiteContentWithFields(
        existingAbout[0].id,
        { title: 'About Us' },
        aboutFields
      );
      console.log('About Us updated');
    } else {
      // Create new about us content
      await db.createWebsiteContentWithFields({
        section_id: aboutSection.id,
        title: 'About Us',
        status: 'published',
        sort_order: 0
      }, aboutFields);
      console.log('About Us created');
    }
  } catch (error) {
    console.error('About Us migration failed:', error);
    throw error;
  }
};

// Function to get content that works with both Strapi and Supabase
export const getWebsiteContent = async (sectionKey, useSupabase = false) => {
  if (useSupabase) {
    // Get from Supabase
    try {
      const { data, error } = await db.getWebsiteContentBySection(sectionKey);
      if (error) throw error;
      return { data: data || [], source: 'supabase' };
    } catch (error) {
      console.error(`Error fetching ${sectionKey} from Supabase:`, error);
      return { data: [], source: 'supabase', error };
    }
  } else {
    // Get from Strapi (fallback)
    return { data: [], source: 'strapi', error: 'Strapi fallback not implemented' };
  }
};

// Function to get single content item (for hero, about_us)
export const getWebsiteSingleContent = async (sectionKey, useSupabase = false) => {
  if (useSupabase) {
    try {
      const { data, error } = await db.getWebsiteSingleContent(sectionKey);
      if (error) throw error;
      return { data: data && data.length > 0 ? data[0] : null, source: 'supabase' };
    } catch (error) {
      console.error(`Error fetching ${sectionKey} from Supabase:`, error);
      return { data: null, source: 'supabase', error };
    }
  } else {
    return { data: null, source: 'strapi', error: 'Strapi fallback not implemented' };
  }
};