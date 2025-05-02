import KelolaAdmin from '../../../src/pages/admin/ListAdmin';
import React from 'react';
import { mount } from 'cypress/react';
import 'react-toastify/dist/ReactToastify.css';

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
    mount(<KelolaAdmin />);
    cy.wait('@getAdmins');

    // Pastikan data muncul
    cy.contains('Admin Satu').should('exist');
    cy.contains('Admin Dua').should('exist');

    // Klik tombol tambah
    cy.contains('Tambah').click();

    // Modal muncul
    cy.contains('Tambah Admin').should('exist');

    // Isi form
    cy.get('input[name="name"]').type('Admin Baru');
    cy.get('input[name="email"]').type('baru@mail.com');
    cy.get('input[name="password"]').type('secret123');

    // Bisa submit form (opsional, karena tidak ingin hit API, cukup test interaksi)
    cy.get('form').submit();
  });
});
