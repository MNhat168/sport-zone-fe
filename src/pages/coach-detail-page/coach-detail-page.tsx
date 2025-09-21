import { NavbarDarkComponent } from "../../components/header/navbar-dark-component"
import { Card, CardContent, CardFooter } from "../../components/ui/card"
import { Label } from "../../components/ui/label"
import { Button } from "../../components/ui/button"
import { Input } from "@/components/ui/input"
export default function CoachDetailPage() {


    return (
        <>
            <NavbarDarkComponent />
            {/* Banner */}
            <div className="min-h-screen bg-gray-500  sticky-navbar-offset">
                <Card>

                </Card>
            </div>
            {/* Coach profile and book */}
            <div className="grid grid-cols-10 gap-4">
                {/* left */}
                <div className="col-span-7 bg-blue-500 border-0 shadow-none flex flex-col gap-4">
                    <Card>
                        {/* coach profile */}

                    </Card>

                    {/* fast click navigate button */}
                    <Card>
                        <CardContent>
                            <Button>Lessons With Me</Button>
                            <Button>Coaching</Button>
                            <Button>Gallery</Button>
                            <Button>Reviews</Button>
                        </CardContent>
                    </Card>
                </div>

                {/* right */}
                <Card className="col-span-3 bg-red-500 border-0 shadow-none flex flex-col gap-4">
                    <h4>Book A Coach</h4>
                    <div className="border-t border-gray-100" />
                    <CardContent>
                        <div>
                            <Label>
                                {/* coach name display */}
                                <h6>Kevin Anderson available</h6>
                            </Label>
                            <div>
                                {/* Money Display */}
                            </div>
                        </div>
                        <Button>Book Now</Button>
                    </CardContent>
                </Card>
            </div>
            {/* Bio and avaiblity */}
            <div className="grid grid-cols-10 gap-4">
                {/* left */}
                <Card className="col-span-7 bg-blue-500 border-0 shadow-none flex flex-col gap-4">
                    <h4>Short Bio</h4>
                    <div className="border-t border-gray-100" />
                    <CardContent>
                        <p>Kevin Anderson is a professional tennis coach with over 10 years of experience. He has coached players of all levels, from beginners to advanced players.</p>
                    </CardContent>
                    <Button>View More</Button>
                </Card>

                {/* right */}
                <Card className="col-span-3 bg-red-500 border-0 shadow-none flex flex-col gap-4">
                    <h4>Availability</h4>
                    <CardContent>
                        {/* calendars list */}
                        <div className="flex justify-between items-center">

                        </div>
                    </CardContent>
                </Card>
            </div>
            {/* lesson, chat, request, galery */}
            <div className="grid grid-cols-10 gap-4">
                {/* left */}
                <div className="col-span-7 bg-blue-500 border-0 shadow-none flex flex-col gap-4">
                    {/* lesson with me */}
                    <Card>
                        <h4>Lessons With Me</h4>
                        <div className="border-t border-gray-100" />
                        <CardContent>
                            <p>Kevin Anderson is a professional tennis coach with over 10 years of experience. He has coached players of all levels, from beginners to advanced players.</p>
                        </CardContent>
                        <Button>View More</Button>
                    </Card>
                    {/* coaching */}
                    <Card>
                        <h4>Coaching</h4>
                        <div className="border-t border-gray-100" />
                        <CardContent>
                            <p>Kevin Anderson is a professional tennis coach with over 10 years of experience. He has coached players of all levels, from beginners to advanced players.</p>
                        </CardContent>
                        <Button>View More</Button>
                    </Card>
                    {/* reviews */}
                    <Card>
                        <div>
                            <h4>Reviews</h4>
                            <Button>Write Review</Button>
                        </div>

                        <div className="border-t border-gray-100" />
                        <CardContent>
                            <p>Kevin Anderson is a professional tennis coach with over 10 years of experience. He has coached players of all levels, from beginners to advanced players.</p>
                        </CardContent>
                        <Button>View More</Button>
                    </Card>
                    {/* location */}
                    <Card></Card>
                </div>

                {/* right */}
                <div className="col-span-3 bg-red-500 border-0 shadow-none flex flex-col gap-4">
                    {/* request for availability */}
                    <Card>
                        <h4>Request for Availability</h4>
                        <div className="border-t border-gray-100" />
                        <CardContent>
                            <form>
                                <div className="flex flex-col gap-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="Name">Name</Label>
                                        <Input
                                            id="name"
                                            type="name"
                                            placeholder="Enter Name"
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="Name">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="m@example.com"
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="Name">Phone</Label>
                                        <Input
                                            id="phone"
                                            type="phone"
                                            placeholder="Enter Phone"
                                            required
                                        />
                                    </div>
                                </div>
                            </form>
                        </CardContent>
                        <CardFooter>
                            <Button>Send Request</Button>
                        </CardFooter>
                    </Card>
                    <Card>
                        <h4>Listing By Owner</h4>
                        <div className="border-t border-gray-100" />
                        <CardContent>
                            <p>Kevin Anderson is a professional tennis coach with over 10 years of experience. He has coached players of all levels, from beginners to advanced players.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

        </>
    )
}
