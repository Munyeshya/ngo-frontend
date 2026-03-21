const endpoints = {
  projects: '/projects/',
  projectDetails: (id) => `/projects/${id}/`,

  partners: '/projects/partners/',
  partnerDetails: (id) => `/projects/partners/${id}/`,

  beneficiaries: '/beneficiaries/',
  beneficiaryDetails: (id) => `/beneficiaries/${id}/`,

  donations: '/donations/',

  projectUpdates: '/projects/updates/',
  projectUpdateDetails: (id) => `/projects/updates/${id}/`,

  subscribeToProject: '/projects/interests/subscribe/',
  unsubscribeFromProject: '/projects/interests/unsubscribe/',
}

export default endpoints