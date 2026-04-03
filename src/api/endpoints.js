const endpoints = {
  projects: '/projects/',
  projectDetails: (id) => `/projects/${id}/`,

  partners: '/projects/partners/',
  partnerDetails: (id) => `/projects/partners/${id}/`,

  beneficiaries: '/beneficiaries/',
  beneficiaryDetails: (id) => `/beneficiaries/${id}/`,
  beneficiaryImages: '/beneficiaries/images/',
  beneficiaryImageDetails: (id) => `/beneficiaries/images/${id}/`,

  donations: '/donations/',

  projectUpdates: '/projects/updates/',
  projectUpdateDetails: (id) => `/projects/updates/${id}/`,
  projectUpdateImages: '/projects/updates/images/',
  projectUpdateImageDetails: (id) => `/projects/updates/images/${id}/`,

  subscribeToProject: '/projects/interests/subscribe/',
  unsubscribeFromProject: '/projects/interests/unsubscribe/',
  
  login: '/users/login/',
  register: '/users/register/',
  refreshToken: '/users/token/refresh/',
  logout: '/users/logout/',
  profile: '/users/profile/',
  me: '/users/me/',
  users: '/users/',
  userDetails: (id) => `/users/${id}/`,
  claimDonorAccount: '/users/claim-donor-account/',
  claimDonorAccountVerify: '/users/claim-donor-account/verify/',
   
  myDonations: '/donations/my/',
  myInterests: '/projects/interests/my/',
}

export default endpoints
