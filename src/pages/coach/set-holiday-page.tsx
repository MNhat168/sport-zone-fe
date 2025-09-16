import React, { useState } from "react";
import { Card, Button, Form, Spinner, Alert } from "react-bootstrap";
import Header from "../../components/Header";
import axiosPublic from "../../utils/axios/axiosPublic";

const SetHolidayPage: React.FC = () => {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

    const handleSubmit = async () => {
        if (!startDate || !endDate) {
            setErrorMsg("Please select both start and end dates.");
            return;
        }

        setLoading(true);
        setErrorMsg("");
        setSuccessMsg("");

        try {
            await axiosPublic.post(
                "/schedules/set-holiday",
                { startDate, endDate },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSuccessMsg(`Holiday set from ${startDate} to ${endDate}`);
            setStartDate("");
            setEndDate("");
        } catch (err: any) {
            console.error(err);
            setErrorMsg(err.response?.data?.message || "Failed to set holiday");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4">
            <Header hideBrowseLinks />
            <Card className="p-3" style={{ maxWidth: "500px", margin: "0 auto" }}>
                <h4>Set Holiday</h4>
                {successMsg && <Alert variant="success">{successMsg}</Alert>}
                {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}

                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Start Date</Form.Label>
                        <Form.Control
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>End Date</Form.Label>
                        <Form.Control
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </Form.Group>

                    <Button variant="primary" onClick={handleSubmit} disabled={loading}>
                        {loading ? <Spinner animation="border" size="sm" /> : "Set Holiday"}
                    </Button>
                </Form>
            </Card>
        </div>
    );
};

export default SetHolidayPage;
