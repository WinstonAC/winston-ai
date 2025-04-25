import { faker } from '@faker-js/faker';

describe('Critical User Flows', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Authentication Flow', () => {
    it('should handle successful login', () => {
      cy.get('[data-testid="login-email"]').type('admin@winston-ai.com');
      cy.get('[data-testid="login-password"]').type('demo123');
      cy.get('[data-testid="login-submit"]').click();
      cy.url().should('include', '/dashboard');
    });

    it('should handle failed login', () => {
      cy.get('[data-testid="login-email"]').type('wrong@email.com');
      cy.get('[data-testid="login-password"]').type('wrongpassword');
      cy.get('[data-testid="login-submit"]').click();
      cy.get('[data-testid="error-message"]').should('be.visible');
    });
  });

  describe('Campaign Management', () => {
    beforeEach(() => {
      cy.login('admin@winston-ai.com', 'demo123');
    });

    it('should create a new campaign', () => {
      cy.visit('/campaigns/new');
      cy.get('[data-testid="campaign-name"]').type('Test Campaign');
      cy.get('[data-testid="campaign-template"]').select('Welcome Template');
      cy.get('[data-testid="campaign-schedule"]').select('immediate');
      cy.get('[data-testid="create-campaign"]').click();
      cy.url().should('include', '/campaigns/');
    });

    it('should update campaign status', () => {
      cy.visit('/campaigns');
      cy.get('[data-testid="campaign-status"]').first().click();
      cy.get('[data-testid="status-paused"]').click();
      cy.get('[data-testid="campaign-status"]').first().should('contain', 'Paused');
    });
  });

  describe('Lead Management', () => {
    beforeEach(() => {
      cy.login('admin@winston-ai.com', 'demo123');
    });

    it('should import leads from CSV', () => {
      cy.visit('/leads');
      cy.get('[data-testid="import-leads"]').click();
      cy.get('input[type="file"]').attachFile('sample-leads.csv');
      cy.get('[data-testid="upload-submit"]').click();
      cy.get('[data-testid="success-message"]').should('be.visible');
    });

    it('should update lead status', () => {
      cy.visit('/leads');
      cy.get('[data-testid="lead-status"]').first().click();
      cy.get('[data-testid="status-qualified"]').click();
      cy.get('[data-testid="lead-status"]').first().should('contain', 'Qualified');
    });
  });

  describe('Team Management', () => {
    beforeEach(() => {
      cy.login('admin@winston-ai.com', 'demo123');
    });

    it('should invite new team member', () => {
      cy.visit('/team');
      cy.get('[data-testid="invite-member"]').click();
      cy.get('[data-testid="invite-email"]').type(faker.internet.email());
      cy.get('[data-testid="invite-role"]').select('Member');
      cy.get('[data-testid="send-invite"]').click();
      cy.get('[data-testid="success-message"]').should('be.visible');
    });

    it('should update team member role', () => {
      cy.visit('/team');
      cy.get('[data-testid="member-role"]').first().click();
      cy.get('[data-testid="role-manager"]').click();
      cy.get('[data-testid="member-role"]').first().should('contain', 'Manager');
    });
  });

  describe('Analytics Dashboard', () => {
    beforeEach(() => {
      cy.login('admin@winston-ai.com', 'demo123');
    });

    it('should display campaign metrics', () => {
      cy.visit('/analytics');
      cy.get('[data-testid="campaign-metrics"]').should('be.visible');
      cy.get('[data-testid="conversion-rate"]').should('be.visible');
    });

    it('should filter analytics by date range', () => {
      cy.visit('/analytics');
      cy.get('[data-testid="date-range"]').click();
      cy.get('[data-testid="last-30-days"]').click();
      cy.get('[data-testid="metrics-updated"]').should('be.visible');
    });
  });
}); 