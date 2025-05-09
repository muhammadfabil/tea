import KelolaAdmin from '../../../src/pages/admin/ListAdmin';
import React from 'react';
import { mount } from 'cypress/react';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from '../../../src/context/AuthContext';

// Mock localStorage token dan axios
const fakeAdmins = [
  { id: 1, name: 'Admin Satu', email: 'admin1@mail.com' },
  { id: 2, name: 'Admin Dua', email: 'admin2@mail.com' },
];

beforeEach(() => {
  localStorage.setItem('auth', JSON.stringify({ token: 'fake-token' }));
  
  cy.intercept('GET', '**/admin/all', {
    statusCode: 200,
    body: fakeAdmins,
  }).as('getAdmins');
});

describe('<KelolaAdmin />', () => {
  it('should render admin list and open modal on add', () => {
    // Create mock auth context value inside the test
    const mockAuthContextValue = {
      user: { role: 'admin' },
      token: 'fake-token',
      isAuthenticated: true,
      login: cy.stub().as('loginStub'),
      logout: cy.stub().as('logoutStub'),
      refreshProfile: cy.stub().as('refreshProfileStub')
    };
    
    // Mount the component with mock AuthProvider
    mount(
      <AuthContext.Provider value={mockAuthContextValue}>
        <KelolaAdmin />
      </AuthContext.Provider>
    );
    cy.wait('@getAdmins');

    // Pastikan data muncul
    cy.contains('Admin Satu').should('exist');
    cy.contains('Admin Dua').should('exist');

    // Klik tombol tambah - using the correct button text from the component
    cy.contains('Tambah Admin').click();

    // Modal muncul - check for the title in the modal
    cy.contains('Tambah Admin').should('exist');

    // Isi form
    cy.get('input[name="name"]').type('Admin Baru');
    cy.get('input[name="email"]').type('baru@mail.com');
    cy.get('input[name="password"]').type('secret123');

    // Submit form using the button rather than form submit
    cy.contains('button', 'Simpan').click();
  });
  
  it('should render admin list and open modal on add failed', () => {
    // Create mock auth context value inside the test
    const mockAuthContextValue = {
      user: { role: 'admin' },
      token: 'fake-token',
      isAuthenticated: true,
      login: cy.stub().as('loginStub'),
      logout: cy.stub().as('logoutStub'),
      refreshProfile: cy.stub().as('refreshProfileStub')
    };
    
    // Setup intercept for failed post request
    cy.intercept('POST', '**/admin/', {
      statusCode: 400,
      body: { message: 'Gagal menyimpan data.' }
    }).as('addAdminFailed');
    
    // Mount the component with mock AuthProvider
    mount(
      <AuthContext.Provider value={mockAuthContextValue}>
        <KelolaAdmin />
      </AuthContext.Provider>
    );
    cy.wait('@getAdmins');

    // Klik tombol tambah - using the correct button text from the component
    cy.contains('Tambah Admin').click();

    // Modal muncul - check for the title in the modal
    cy.contains('Tambah Admin').should('exist');

    // Isi form dengan data tidak valid
    cy.get('input[name="name"]').type('Admin Test');
    cy.get('input[name="email"]').type('invalidEmail');
    cy.get('input[name="password"]').type('pass123');

    // Submit form using the button rather than form submit
    cy.contains('button', 'Simpan').click();
    
    // Wait for the failed request
    cy.wait('@addAdminFailed');
    
    // Verify error toast message appears
    cy.contains('Gagal menyimpan data').should('exist');
  });
});
