// Main export file that re-exports everything from the modular Supabase structure

// Core client and utilities
export { supabase } from './client.js'
export { logSupabaseError, withErrorHandling, debugSupabase } from './utils.js'

// Authentication
export { auth } from './auth.js'

// User and profile management
export { users } from './users.js'

// Dog management
export { dogs } from './dogs.js'

// Training sessions
export { sessions } from './sessions.js'

// Messaging system
export { messages } from './messages.js'

// Contact submissions and client conversions
export { contacts } from './contacts.js'

// File storage
export { storage } from './storage.js'

// Website content management
export { website } from './website.js'

// Import modules for internal use in db object
import { supabase } from './client.js'
import { auth } from './auth.js'
import { users } from './users.js'
import { dogs } from './dogs.js'
import { sessions } from './sessions.js'
import { messages } from './messages.js'
import { contacts } from './contacts.js'
import { storage } from './storage.js'
import { website } from './website.js'

// Combined database object for backward compatibility
export const db = {
  // Direct supabase access for complex queries
  supabase,
  
  // Users & Profiles
  getProfile: users.getProfile,
  getUser: users.getUser,
  updateProfile: users.updateProfile,
  saveOnboardingData: users.saveOnboardingData,
  getOnboardingData: users.getOnboardingData,
  getAllProfiles: users.getAllProfiles,
  getAllProfilesWithUserData: users.getAllProfilesWithUserData,
  getActiveClients: users.getActiveClients,
  getProfileWithUserData: users.getProfileWithUserData,
  deactivateClientByEmail: users.deactivateClientByEmail,
  deleteClientCompletely: users.deleteClientCompletely,
  getSettings: users.getSettings,
  updateSetting: users.updateSetting,
  getClientNotes: users.getClientNotes,
  createClientNote: users.createClientNote,
  updateClientNote: users.updateClientNote,
  deleteClientNote: users.deleteClientNote,
  
  // Contact submissions
  createContactSubmission: contacts.createContactSubmission,
  getContactSubmissions: contacts.getContactSubmissions,
  getContactSubmissionByEmail: contacts.getContactSubmissionByEmail,
  checkContactHasClientProfile: contacts.checkContactHasClientProfile,
  updateContactSubmission: contacts.updateContactSubmission,
  deleteContactSubmissions: contacts.deleteContactSubmissions,
  convertContactToClient: contacts.convertContactToClient,
  createSignupInvitation: contacts.createSignupInvitation,
  getSignupInvitation: contacts.getSignupInvitation,
  markInvitationUsed: contacts.markInvitationUsed,
  getSignupInvitations: contacts.getSignupInvitations,
  
  // Messages
  getMessages: messages.getMessages,
  getMessagesWithReadStatus: messages.getMessagesWithReadStatus,
  createMessage: messages.createMessage,
  markMessageAsRead: messages.markMessageAsRead,
  getMessageTemplates: messages.getMessageTemplates,
  getAllMessageTemplates: messages.getAllMessageTemplates,
  createMessageTemplate: messages.createMessageTemplate,
  updateMessageTemplate: messages.updateMessageTemplate,
  deleteMessageTemplate: messages.deleteMessageTemplate,
  getMessageReadReceipts: messages.getMessageReadReceipts,
  createMessageReadReceipt: messages.createMessageReadReceipt,
  
  // Dogs
  getDogs: dogs.getDogs,
  getDogsWithOwners: dogs.getDogsWithOwners,
  createDog: dogs.createDog,
  updateDog: dogs.updateDog,
  deleteDog: dogs.deleteDog,
  
  // Sessions
  getSessions: sessions.getSessions,
  getAllSessions: sessions.getAllSessions,
  createSession: sessions.createSession,
  updateSession: sessions.updateSession,
  deleteSession: sessions.deleteSession,
  getThisWeekSessions: sessions.getThisWeekSessions,
  
  // File Storage
  uploadDogPhoto: storage.uploadDogPhoto,
  getDogPhotoUrl: storage.getDogPhotoUrl,
  deleteDogPhoto: storage.deleteDogPhoto,
  uploadPublicMedia: storage.uploadPublicMedia,
  getPublicMediaUrl: storage.getPublicMediaUrl,
  deletePublicMedia: storage.deletePublicMedia,
  listPublicMedia: storage.listPublicMedia,
  uploadSystemMedia: storage.uploadSystemMedia,
  getSystemMediaUrl: storage.getSystemMediaUrl,
  uploadProfilePhoto: storage.uploadProfilePhoto,
  getProfilePhotoUrl: storage.getProfilePhotoUrl,
  deleteProfilePhoto: storage.deleteProfilePhoto,
  uploadWebsiteMedia: storage.uploadWebsiteMedia,
  getWebsiteMediaUrl: storage.getWebsiteMediaUrl,
  deleteWebsiteMedia: storage.deleteWebsiteMedia,
  listWebsiteMedia: storage.listWebsiteMedia,

  // Website Content Management
  getWebsiteSections: website.getWebsiteSections,
  getWebsiteContentBySection: website.getWebsiteContentBySection,
  getWebsiteSingleContent: website.getWebsiteSingleContent,
  getWebsiteContentWithFields: website.getWebsiteContentWithFields,
  getWebsiteContentById: website.getWebsiteContentById,
  createWebsiteSection: website.createWebsiteSection,
  updateWebsiteSection: website.updateWebsiteSection,
  deleteWebsiteSection: website.deleteWebsiteSection,
  createWebsiteContent: website.createWebsiteContent,
  updateWebsiteContent: website.updateWebsiteContent,
  deleteWebsiteContent: website.deleteWebsiteContent,
  upsertWebsiteContentField: website.upsertWebsiteContentField,
  deleteWebsiteContentField: website.deleteWebsiteContentField,
  updateWebsiteContentFields: website.updateWebsiteContentFields,
  createWebsiteContentWithFields: website.createWebsiteContentWithFields,
  updateWebsiteContentWithFields: website.updateWebsiteContentWithFields
}