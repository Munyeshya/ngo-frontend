const endpoints = {
  projects: '/projects/',
  projectDetails: (id) => `/projects/${id}/`,

  beneficiaries: '/beneficiaries/',
  beneficiaryDetails: (id) => `/beneficiaries/${id}/`,

  donations: '/donations/',
  myDonations: '/donations/my/',

  projectUpdates: '/projects/updates/',
  projectUpdateDetails: (id) => `/projects/updates/${id}/`,

  partners: '/projects/partners/',
  subscribeToProject: '/projects/interests/subscribe/',
  unsubscribeFromProject: '/projects/interests/unsubscribe/',
}

export default endpoints