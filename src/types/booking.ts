// The booking object, exactly as the API docs describe it.
// `?` after additionalneeds = this field is optional.
export interface Booking {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: {
    checkin: string;
    checkout: string;
  };
  additionalneeds?: string;
}
