/* global cy Cypress */

import { LOCAL_HOST } from '../../constants'

const navLinks = ['Home', 'About', 'Settings']

describe('As a user', () => {
  beforeEach(() => {
    cy.visit(LOCAL_HOST)
  })

  describe('on the home page', () => {
    it('I can see the home page', () => {
      cy.get('#home-page').should('exist')
    })
  })

  describe('with header', () => {
    it('I can see the header', () => {
      cy.get('#header-component').should('exist')
    })

    it('I can see the brand', () => {
      cy.get('#header-brand').should('exist')
      cy.get('#header-brand').contains('ReprMan - Repertoire Management')
    })

    it('I can click the brand and I end on the home page', () => {
      cy.get('#header-brand').click()
      cy.get('#home-page').should('exist')
    })

    it(`I can see all the nav links`, () => {
      cy.get('.nav-link')
        .then(($els) => Cypress.$.makeArray($els).map((el) => el.innerText))
        .should(
          'deep.equal',
          navLinks.map((r) => r.toUpperCase())
        )
    })

    describe('for each nav link', () => {
      navLinks.forEach((route) => {
        it(`I can click on "${route}" and it takes me there`, () => {
          cy.get(`#nav-link-${route}`).click()
          cy.get(`#${route}-page`).should('exist')
        })
      })
    })
  })

  describe('with Controls', () => {
    it('I can see the Controls', () => {
      cy.get('#controls-component').should('exist')
    })

    it('I can see the Add Repr button', () => {
      cy.get('#add-repr-button').should('exist')
    })

    it('I can press the Add Repr Button and see the Edit Repr modal', () => {
      cy.get('#edit-repr-modal').should('not.exist')
      cy.get('#add-repr-button').click()
      cy.get('#edit-repr-modal').should('exist')
    })

    it('I can see the Filter Button', () => {
      cy.get('#filter-button').should('exist')
    })

    it('I can press the Filter Button make the Filter dropdown appear and disappear', () => {
      cy.get('#filter-form').should('not.exist')
      cy.get('#filter-button').click()
      cy.get('#filter-form').should('exist')
      cy.get('#filter-button').should('have.class', 'show')
      cy.get('#filter-button').click()
      cy.get('#filter-button').should('not.have.class', 'show')
    })
  })

  describe('with the body', () => {
    it('I can reprs list', () => {
      cy.get('#reprs-list-component').should('exist')
    })

    it('I can see no reprs', () => {
      cy.get('.repr-line-component').should('have.length', 0)
    })

    it('I can see the right message', () => {
      cy.get('#reprs-list-component').contains('0 reprs found')
    })
  })

  describe('with the footer', () => {
    it('I can see the footer', () => {
      cy.get('#footer-component').should('exist')
    })

    it('I can see the right message', () => {
      cy.get('#footer-component').contains(
        'copyright ©2022 - kevinsmithwebdev@gmail.com'
      )
    })
  })
})
