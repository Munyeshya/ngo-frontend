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
  
  login: '/users/login/',
  register: '/users/register/',
  refreshToken: '/users/token/refresh/',
  logout: '/users/logout/',
  profile: '/users/profile/',
  me: '/users/me/',
  claimDonorAccount: '/users/claim-donor-account/',
   
  myDonations: '/donations/my/',
  myInterests: '/projects/interests/my/',
}

export default endpoints